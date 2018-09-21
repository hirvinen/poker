const shuffle = require('lodash/shuffle')
const map     = require('lodash/map')
import {createDeck, Joker}    from '../lib/deck'
import {wins, nullWin}        from '../lib/quick_poker'
import {
  roundToPrecision,
  logDeck,
  createBet,
  getKeyboardHandler,
}                             from '../lib/helpers'
import classify               from './classify'

const Card = (props) => {
  const card = props.card
  const {order, position, suit: {color}} = card
  const baseClasses = ['card', position]
  let classes
  if (position === 'deck' || (order > 0 && position != 'hand')) {
    classes = [...baseClasses, 'hidden']
  } else {
    classes = [...baseClasses, color, 'shown']
  }
  return (
    <div
      style={{'--card-order': order}}
      data-order={order}
      data-value={card.toString()}
      className={classes.join(' ')}
      onClick={props.onClick}
    >
    </div>
  )
}

const WinTableRow = (props) => (
  <div className="winTableRow">
    <div className="winTableCell">{props.title}</div>
    {props.cells.map((value, index) => {
      const className = index === props.hlIndex ? "winTableCell currentBet" : "winTableCell"
      return <div className={className} key={props.title + value}>{value}</div>
    })}
  </div>
)

const WinTable = (props) => (
  <div className="winTable">
    <WinTableRow title='' cells={props.bet.values()} hlIndex={props.bet.index} />
    {map(props.wins, (win, winKey) => (
      <WinTableRow
        title={win.description}
        cells={props.bet.values().map(value => roundToPrecision(value*win.multiplier,1))}
        key={winKey}
        hlIndex={props.bet.index}
      />
    ))}
  </div>
)

const PokerTitle = (props) => <div className="title"><h1>QuickPoker</h1></div>
const PokerInfo  = (props) => {
  const infoText = <p>Click the deck to deal two cards, then choose left or right stack to complete your hand</p>
  return <div className="info">{infoText}</div>
}

const StatusLine = (props) => (
  <React.Fragment>
    <div className="money">Money:&nbsp;{props.money}</div>
    {props.bet}
    <div className="result">Last&nbsp;round result:&nbsp;{props.result}</div>
    <div className="jokerRounds">Joker&nbsp;rounds:&nbsp;{props.jokerRounds}</div>
  </React.Fragment>
)

class Game extends React.Component {
  constructor(props) {
    super(props)
    const deck = createDeck().map((card, index) => ({
      ...card,
      position: 'deck',
      order   : index,
    }))
    this.state = {
      deck          : deck,
      joker         : Joker,
      money         : 20,
      bet           : createBet(),
      jokerRounds   : 0,
      jokerInDeck   : false,
      round         : 0,
      gamePhase     : 'start',
      result        : 'Nothing',
      actionQueue   : [],
      keyboardHandlerId: null
    }
    this.handleClick = this.handleClick.bind(this)
  }

  increaseBet () {
    const bet = this.state.bet.increment().limit(this.state.money)
    this.setState({bet})
  }
  
  deal () {
    const {money, bet, round, jokerRounds} = this.state
    // get a random ordering
    const orderArray = shuffle(Array.from(
      {length: this.state.deck.length},
      (_, index) => index
    ))
    // assign order to cards
    const deck = this.state.deck.map((card, index) => {
      const order = orderArray[index]
      switch (order) {
      case 0:
      case 1:
        return {...card, order,            position: 'hand'}
      case 2:
      case 3:
      case 4:
        return {...card, order: order - 2, position: 'left'}
      case 5:
      case 6:
      case 7:
        return {...card, order: order - 5, position: 'right'}
      default:
        return {...card, order: order - 8, position: 'deck'}
      }
    })
    this.setState({
      deck,
      money       : roundToPrecision(money - bet.value,1),
      gamePhase   : 'handDealt',
      round       : round + 1
    })

    if (jokerRounds >= 1) {
      this.setState({
        jokerRounds: jokerRounds -1
      })
    }
  }
  
  addJokerRounds (count = 10) {
    const {jokerInDeck, jokerRounds, actionQueue, jokerAdded} = this.state
    // If joker was not in the deck, show it but do not add it to the deck yet
    if (!jokerInDeck) {
      this.setState({
        jokerAdded  : !jokerAdded,
        actionQueue : [...actionQueue, 'addJokerToDeck']
      })
    }

    // Joker already in deck, so just add joker rounds
    this.setState({
      jokerRounds: jokerRounds +10
    })
  }

  addJokerToDeck () {
    const {jokerInDeck, deck} = this.state
    
    // only add Joker to deck if not already present
    if (!jokerInDeck) {
      this.setState({
        jokerInDeck : true,
        jokerAdded  : false,
        deck        : [...deck, {...Joker, position: 'deck', order: 52}]
      })
    } else {
      throw Error('Deck already had a Joker')
    }
  }

  removeJokerFromDeck () {
    const {jokerInDeck, deck} = this.state
    if (jokerInDeck) {
      this.setState({
        jokerInDeck : false,
        deck        : deck.filter(card => card.value !== 0)
      })
    } else {
      throw Error('Deck does not have a Joker')
    }
  }
  
  choose (choice) {
    const gamePhase       = choice
    const toDeck          = (choice === 'left') ? 'right' : 'left'
    const orderIncrement  = this.state.deck.length - 8
    const deck = this.state.deck.map(card => {
      const {position, order} = card
      if (position === toDeck) {
        return {...card, order: order + orderIncrement, position: 'deck'}
      } else if (position === choice) {
        return {...card, order: order + 2,              position: 'hand'}
      }

      // already in deck
      return card
    })

    this.setState({
      deck,
      gamePhase
    })
    this.handleResult()
  }
  
  handleResult () {
    // final hand
    const hand = this.state.deck.filter(card => card.position === 'hand')
    const handResult = classify(hand)

    // money handling
    const {money, bet} = this.state
    const win       = handResult === 'none' ? nullWin : this.props.wins[handResult]
    const winAmount = roundToPrecision(bet.value * win.multiplier, 1)
    const result    = handResult === 'none' ? 'Nothing' : (win.description + ' = +' + winAmount)
    if (winAmount > 0) {
      this.setState({
        money: roundToPrecision(money + winAmount, 1)
      })
    } else if (money < bet.value) {
      // autolimit bet if low on money
      this.setState({bet: bet.limit(money)})
    }

    const {jokerInDeck, jokerRounds, actionQueue} = this.state
    // on straight or better, add Joker rounds unless Joker was in play
    if (win.multiplier >= 11 && !jokerInDeck) {
      this.addJokerRounds()
    }
    // Queue removing Joker from the deck if this was the last joker round
    if (jokerInDeck && jokerRounds === 0) {
      this.setState({
        actionQueue: [...actionQueue, 'removeJokerFromDeck']
      })
    }

    // show results and finish round
    this.setState({
      result,
      gamePhase: 'roundFinished'
    })
  }

  handleClick (action) {
    const {gamePhase, money, bet, jokerInDeck} = this.state
    // only hanlde queued actions on dealing for now
    switch (action) {
    case 'deal':
      if ((gamePhase === 'start' || gamePhase === 'roundFinished') &&
          money >= bet.value) {
        this.handleActionQueue()
        this.deal()
      }
      break
    case 'bet':
      if ((gamePhase === 'start' || gamePhase === 'roundFinished') &&
          !jokerInDeck) {
          this.increaseBet()
        }
      break
    case 'left':
    case 'right':
      if (gamePhase === 'handDealt') {
        this.choose(action)
      }
      break
    default:
      break
    }
  }

  handleActionQueue () {
    const actionQueue = this.state.actionQueue.filter(action => {
      switch (action) {
      case 'addJokerToDeck':
        this.addJokerToDeck()
        return false
      case 'removeJokerFromDeck':
        this.removeJokerFromDeck()
        return false
      default:
        return true
      }
    })
    this.setState({actionQueue})
    // Throw if something was left
    if (actionQueue.length > 0) {
      console.log('Unknown actions in queue', actionQueue)
      throw Error('Unknown actions in queue')
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
        return this.addJokerRounds()
      }
    }
    
    const keyboardHandlerId = this.props.keyboardHandler
      .registerHandler('keydown', keyToClickMapper)
    this.setState({keyboardHandlerId})
  }

  componentWillUnmount () {
    if (this.state.keyboardHandlerId) {
      this.props.keyboardHandler.removeHandler(this.state.keyboardHandlerId)
    }
  }
 
 /*
  UPDATE: To avoid shuffling DOM nodes around, decouple deck order and DOM order.
    * shuffle an array cardOrder containing numbers from 0 to 51 inclusive (52 if Joker in deck)
    * Assign each card = deck[i] an order value of cardOrder[i]
      * For order <= 7, set position and new order
        * (0,1)   : newOrder = (0,1),   position = hand
        * (2,3,4) : newOrder = (0,1,2), position = left
        * (5,6,7) : newOrder = (0,1,2), position = right
      * For order > 7, subtract 7 from order (1-44(45)) and position to deck
    * When cards are discarded, set position to deck and add 44(45) to order
    * When cards are chosen, set position = hand and add 2 two order => (2,3,4)
  TODO: Fix description below
  Each card in the deck will be assigned an index equal to index in the deck.
  That index will be used as their negative z-index when they are in a hidden state.
  Position on the grid will be determined by the state of the game with this mapping:
    1. When a hand has not been dealt, all cards will be in the deck.
    2. When dealing, do a shuffle animation in the deck position (TODO)
    3. When a hand is dealt:
      * (0,1)       will be on the table 1-5 and 5-9 (hand)
      * (2,3,4)     will be on the table 11-15 (left)
      * (5,6,7)     will be on the table 16-20 (right)
    4. When left or right is chosen
      * (0,1)       will be on the table 1-5 and 5-9 (hand)
      * <chosen>    will be on the table: 9-13, 13-17, 17-21
      * <discarded> will be in the deck
    5. When a joker is added to the deck, put it on the middle of the screen and then move to deck (TODO)
    6. When a joker is removed from the deck, move it to the middle of the screen and vanish it. (TODO)
 */
  renderCards () {
    const {deck, jokerAdded} = this.state
    const clickHandlers = {
      deck  : () => this.handleClick('deal'),
      left  : () => this.handleClick('left'),
      right : () => this.handleClick('right'),
      hand  : null,
      joker : null
    }
    const cards = deck.map(card => {
      if (card.order === 0 && clickHandlers[card.position]) {
        return  (
          <Card
            card={card}
            key={card.toString()}
            onClick={clickHandlers[card.position]}
          />
        )
      }

      return <Card card={card} key={card.toString()} />
    })
    if (jokerAdded) {
      cards.push(
        <Card card={{...Joker, order: 0, position:'joker'}} />
      )
    }
    return (
      <React.Fragment>
        {cards}
      </React.Fragment>
    )
  }

  render () {
    const betButton  = <button className="bet" style={{minWidth: '6vw'}} onClick={() => this.handleClick('bet')}>Bet:&nbsp;{this.state.bet.value}</button>
    return (
      <div className="game">
        <PokerTitle />
        <PokerInfo />
        <StatusLine
          money={this.state.money}
          result={this.state.result}
          jokerRounds={this.state.jokerRounds}
          bet={betButton}
        />
        <WinTable wins={this.props.wins} bet={this.state.bet} />
        {this.renderCards()}
      </div>
    )
  }
}

export default () => <Game wins={wins} keyboardHandler={getKeyboardHandler()} />