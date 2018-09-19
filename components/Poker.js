const shuffle = require('lodash/shuffle')
const map     = require('lodash/map')
import classify from './classify'

const round   = (number, precision=0) => Math.round(number * 10**precision)/(10**precision)
const logDeck = (deck, description='') => {
  console.log(description, deck.map(card => card.toString()))
}

const suits = () => ([
  {
    name  : 'Hearts',
    short : 'H',
    symbol: '♥',
    color : 'red'
  },
  {
    name  : 'Clubs',
    short : 'C',
    symbol: '♣',
    color : 'black'
  },
  {
    name  : 'Diamonds',
    short : 'D',
    symbol: '♦',
    color : 'red'
  },
  {
    name  : 'Spades',
    short : 'S',
    symbol: '♠',
    color : 'black'
  }
])

const cardLetterMap = [
  '*J*',
  'A',
  2,3,4,5,6,7,8,9,10,
  'J','Q','K'
]

const createCard = (suit, value) => ({
    suit,
    value,
    toString: () => suit.symbol + cardLetterMap[value]
})

const createDeck = () => (
  suits().map( (suit) => (
    Array.from({length: 13}, (value, i) => i+1).map( value => 
      createCard(suit,value)
    )
  )).reduce( (a, b) => a.concat(b), [])
)

const Joker = {
  suit : {
    name : 'Joker',
    short: 'J'
  },
  value : 0,
  toString : () => ('🃏')
}

const pickCards = (deck, count) => ({
  picked: deck.slice( 0, count),
  rest: deck.slice(count, deck.length)
})

const newGame = (jokerRounds = 0, money = 20, bet = 0.2) => {
  const initialDeck = createDeck()
  if (jokerRounds > 0) {
    initialDeck.push(Joker)
    jokerRounds--
  } else {
    jokerRounds = 0
  }
  const deck = shuffle(initialDeck)
  const {picked:hand, rest:deckAfterDealing} = pickCards(deck, 2)
  const {picked:left, rest:deckAfterLeft} = pickCards(deckAfterDealing, 3)
  const {picked:right, rest:remainingDeck} = pickCards(deckAfterLeft, 3)
  return {hand, left, right, remainingDeck, deckAfterDealing, jokerRounds, money, bet}
}

const winMultipliers = {
	fiveOfAKind		: 100,
	royalFlush		: 100,
	straightFlush	: 75,
	fourOfAKind 	: 50,
	fullHouse		  : 20,
	flush			    : 15,
	straight		  : 11,
	threeOfAKind	: 5,
	twoPairs		  : 3,
  pair10ToAce		: 2,
  none          : 0
}

const wins = {
  fiveOfAKind		: {
    description: "Five of a kind",
    multiplier: 100
  },
	royalFlush		: {
    description: "Royal Flush",
    multiplier: 100
  },
	straightFlush	: {
    description: "Straight Flush",
    multiplier: 75
  },
	fourOfAKind 	: {
    description: "Four of a kind",
    multiplier: 50
  },
	fullHouse		  : {
    description: "Full House",
    multiplier: 20
  },
	flush			    : {
    description: "Flush",
    multiplier: 15
  },
	straight		  : {
    description: "Straight",
    multiplier: 11
  },
	threeOfAKind	: {
    description: "Three of a kind",
    multiplier: 5
  },
	twoPairs		  : {
    description: "Two pairs",
    multiplier: 3
  },
  pair10ToAce		: {
    description: "Pair 10-A",
    multiplier: 2
  },
}

const nullWin = {
  description: 'Nothing',
  multiplier : 0
}

const bets = [
  0.2,
  0.4,
  0.6,
  0.8,
  1
]

const game = newGame()

//const bestHandWithLeft  = bestHand(game.hand, game.left)
//const bestHandWithRight = bestHand(game.hand, game.right)

const cardWidth  = 16
const cardHeight = 24
const cardSizeUnit = 'vw'

const basicCardStyle = {
  border: '1px solid black',
  margin: '0.1vw',
  textAlign: 'center',
  fontSize: '1em',
  minWidth: cardWidth + cardSizeUnit,
  maxWidth: cardWidth + cardSizeUnit,
  minHeight: cardHeight + cardSizeUnit,
  maxHeight: cardHeight + cardSizeUnit,
  borderRadius: '5%',
  background: 'white'
}
const cardStyle = {
  ...basicCardStyle,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
}
const Card = (props) => (
  <div style={{...cardStyle, color: props.card.suit.color}}>{props.card.toString()}</div>
)
const HiddenCard = (props) => (
  <div style={{
    ...basicCardStyle,
    zIndex: (-1 - props.depth),
    background: "lightgray",
    position: "absolute",
    top: props.depth / props.compression + 'vw',
    left:props.depth / props.compression + 'vw'
  }}></div>
)

const CardSet = (props) => (
  <div style={{flexGrow: props.cards.length}}>
    <div style={{width: '100%', textAlign: 'center'}}>{props.title}</div>
    <div style={{width: '100%', display: 'flex', justifyContent: 'space-evenly'}}>
      {props.cards.map(card => <Card card={card} key={card.toString()}/>)}
    </div>
  </div>
)

const CardStack = (props) => (
  <div
    style={{flexGrow: 1, maxHeight: 1.5 * cardHeight + cardSizeUnit}}
    onClick={props.onClick}
  >
    <div style={{width: '100%', textAlign: 'center'}}>{props.title}</div>
    <div style={{width: '100%', position: 'relative', minWidth: (cardWidth + 1) + cardSizeUnit, minHeight: (cardHeight + 1) + cardSizeUnit}}>
      {props.cards.slice(0, (props.show === 0) ? props.show : props.show || 1).map(card => <Card card={card} key={card.toString()}/>)}
      {props.cards.slice( (props.show === 0) ? props.show: props.show || 1).map((card,index) => <HiddenCard depth={index} compression={props.cards.length} key={props.title + index} />)}
    </div>
  </div>
)

const BestHand = (props) => (
  <div>
    <p>Best hand with {props.choice} is {props.bestHand}</p>
  </div>
)

const cellStyle = {
  display   : 'table-cell',
  minWidth  : '3vw',
  textAlign : 'right',
  fontSize  : '80%'
}

const cellStyleHL = {
  ...cellStyle,
  background: 'lightgray'
}

const WinTableRow = (props) => (
  <div style={{display: 'table-row'}}>
    <div style={{...cellStyle, textAlign: 'left'}}>{props.title}</div>
    {props.cells.map((value, index) => {
      const style = index === props.hlIndex ? cellStyleHL : cellStyle
      return <div style={style} key={props.title + value}>{value}</div>
    })}
  </div>
)

const WinTable = (props) => (
  <div style={{display: 'table'}}>
    <WinTableRow title='' cells={props.bet.values()} hlIndex={props.bet.index} />
    {map(props.wins, (win, winKey) => (
      <WinTableRow
        title={win.description}
        cells={props.bet.values().map(value => round(value*win.multiplier,1))}
        key={winKey}
        hlIndex={props.bet.index}
      />
    ))}
  </div>
)

const StatusLine = (props) => (
  <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
    <div>Money:&nbsp;{props.money}</div>
    <div>Last&nbsp;round result:&nbsp;{props.result}</div>
    <div>Joker&nbsp;rounds:&nbsp;{props.jokerRounds}</div>
    {props.bet}
  </div>
)

const tableStyle = {
  display: 'flex',
  justifyContent: 'space-evenly'
}

const createBet = () => {
  const bet = {
    index       : 0,
    multiplier  : 0.2,
    values      : [
      0.2,
      0.4,
      0.6,
      0.8,
      1
    ]
  }
  const betInterface = {
    increment : () => {
      bet.index = (bet.index+1) % 5
      return {...betInterface}
    },
    limit: (limit = 1) => {
      while (bet.index > 0 && bet.values[bet.index] > limit) {
        bet.index--
      }
      return {...betInterface}
    },
    toString  : () => bet.values[bet.index],
    values    : () => [...bet.values],
    get value() {
      return bet.values[bet.index]
    },
    get index() {
      return bet.index
    }
  }
  return betInterface
}

const getKeyboardHandler = () => {
  const handlers = []

  const registerHandler = (eventType, handler) => {
    const handlerRecord = {
      eventType,
      handler,
      enabled: true,
      wrapper: (event) => {
        if (handlerRecord.enabled) {
          handler(event)
        }
      }
    }
    const id = handlers.push(handlerRecord)
    window.addEventListener(eventType, handlerRecord.wrapper)
    return id
  }

  const removeHandler = (handlerId) => {
    if (handlers.length < handlerId) {
      return false
    }

    const handler = handlers[handlerId - 1]
    handler.enabled = false
    window.removeEventListener(handler.eventType, handler.wrapper)
  }

  return {
    registerHandler,
    removeHandler
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    const deck = createDeck()
    this.state = {
      deck          : deck,
      baseDeck      : deck,
      remainingDeck : [],
      joker         : Joker,
      money         : 20,
      bet           : createBet(),
      hand          : [],
      left          : [],
      right         : [],
      combinedHand  : [],
      chosenCards   : [],
      jokerRounds   : 0,
      jokerInDeck   : false,
      round         : 0,
      choice        : null,
      handDealt     : false,
      roundFinished : false,
      win           : null,
      result        : 'Nothing',
      keyboardHandlerId: null
    }
    this.handleClick = this.handleClick.bind(this)
  }

  increaseBet () {
    const bet = this.state.bet.increment().limit(this.state.money)
    this.setState({bet})
    // todo winTable highlight
  }

  deal () {
    const money = round(this.state.money - this.state.bet.value,1)
    const deck = shuffle(this.state.deck)
    const {picked:hand, rest:deckAfterDealing} = pickCards(deck, 2)
    const {picked:left, rest:deckAfterLeft}    = pickCards(deckAfterDealing, 3)
    const {picked:right, rest:remainingDeck}   = pickCards(deckAfterLeft, 3)
    if (this.state.jokerInDeck) {
      this.setState({
        jokerRounds: Math.max(this.state.jokerRounds -1, 0)
      })
    }
    this.setState({
      deck,
      remainingDeck,
      hand,
      left,
      right,
      money,
      handDealt: true,
      round: this.state.round + 1,
      choice: null,
      roundFinished: false,
    })
  }

  addJokers (count = 10) {
    this.setState({
      jokerRounds: 10,
      jokerInDeck: true,
      deck: [...this.state.baseDeck, Joker]
    })
  }

  win (handResult = 'none') {
    const win       = handResult === 'none' ? nullWin : this.props.wins[handResult]
    const winAmount = round(this.state.bet.value * win.multiplier, 1)
    const result    = handResult === 'none' ? 'Nothing' : (win.description + ' = +' + winAmount)
    const money = round(this.state.money + winAmount, 1)

    // autolimit bet if low on money
    if (money < this.state.bet.value) {
      const bet   = this.state.bet.limit(money)
      this.setState({bet})
    }

    if (this.state.jokerInDeck) {
      if (this.state.jokerRounds === 0) {
        this.setState({
          jokerInDeck: false,
          deck: [...this.state.baseDeck]
        })
      }
    } else  if (win.multiplier >= 11) { // straight
      this.addJokers()
    }
    this.setState({
      money,
      result
    })
  }

  choose (choice) {
    const combinedHand = [...this.state.hand, ...this.state[choice]]
    this.win(classify(combinedHand))
    this.setState({
      choice,
      combinedHand,
      left: [],
      right: [],
      chosenCards: this.state[choice],
      roundFinished: true
    })
  }

  handleClick (action) {
    switch (action) {
    case 'deal':
      if ((!this.state.handDealt || this.state.roundFinished) &&
          this.state.money >= this.state.bet.value) {
        this.deal()
      }
      break
    case 'bet':
      if ((this.state.roundFinished || !this.state.handDealt) &&
          !this.state.jokerInDeck) {
          this.increaseBet()
        }
      break
    case 'left':
    case 'right':
      if (this.state.handDealt &&
          !this.state.roundFinished &&
          !this.state.choice) {
        this.choose(action)
      }
      break
    default:
      break
    }
  }

  componentDidMount () {
    const keyToClickMapper = (event) => {
      switch(event.key) {
      case ' ':
      case 'ArrowDown':
        return this.handleClick('deal')
      case 'ArrowLeft':
        return this.handleClick('left')
      case 'ArrowRight':
        return this.handleClick('right')
      case 'ArrowUp':
        return this.handleClick('bet')
      case 'Add':
        return this.addJokers()
      }
    }

    const keyboardHandlerId =
      this.props.keyboardHandler.registerHandler('keydown', keyToClickMapper)
    this.setState({keyboardHandlerId})
  }

  componentWillUnmount () {
    if (this.state.keyboardHandlerId) {
      this.props.keyboardHandler.removeHandler(this.state.keyboardHandlerId)
    }
  }

  renderTable () {
    if (this.state.round === 0 && !this.state.handDealt) {
      return <div style={tableStyle} />
    } else if (this.state.handDealt && !this.state.roundFinished) {
      return (
        <div style={tableStyle}>
          <CardSet cards={this.state.hand} title="Hand" />
          <div style={{flexGrow: 0.5, minWidth: (0.5 * cardWidth) + cardSizeUnit}} />
          <CardStack
            cards={this.state.left}
            title="Left"
            onClick={(() => this.handleClick('left'))}
          />
          <div style={{flexGrow: 0.5, minWidth: (0.5 * cardWidth) + cardSizeUnit}} />
          <CardStack
            cards={this.state.right}
            title="Right"
            onClick={(() => this.handleClick('right'))}
          />
        </div>
      )
    } else if (this.state.roundFinished) {
      return (
        <div style={tableStyle}>
          <CardSet cards={this.state.hand} title="Hand" />
          <CardSet cards={this.state.chosenCards} title="Chosen cards" />
        </div>
      )
    }
  }

  renderDeck () {
    const deck = this.state.handDealt ? this.state.remainingDeck : this.state.deck
    return (
      <CardStack
        cards={deck}
        title="Deck"
        show={0}
        onClick={() => this.handleClick('deal')}
      />
    )
  }

  render () {
    const betButton  = <button style={{minWidth: '6vw'}} onClick={() => this.handleClick('bet')}>Bet:&nbsp;{this.state.bet.value}</button>
    return (
      <div>
        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
          {this.renderDeck()}
          <div style={{flexGrow: 1}}>
            <WinTable wins={this.props.wins} bet={this.state.bet} />
          </div>
        </div>
        {this.renderTable()}
        <StatusLine
          money={this.state.money}
          result={this.state.result}
          jokerRounds={this.state.jokerRounds}
          bet={betButton}
        />
      </div>
    )
  }
}

export default () => (
  <div>
    <Game wins={wins} keyboardHandler={getKeyboardHandler()} />
  </div>
)
