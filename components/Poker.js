const shuffle = require('lodash/shuffle')
const map     = require('lodash/map')

const suits = () => ([
  {
    name  : 'Hearts',
    short : 'H',
    symbol: '♥'
  },
  {
    name  : 'Clubs',
    short : 'C',
    symbol: '♣'
  },
  {
    name  : 'Diamonds',
    short : 'D',
    symbol: '♦'
  },
  {
    name  : 'Spades',
    short : 'S',
    symbol: '♠'
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
  return {hand, left, right, remainingDeck, jokerRounds, money, bet}
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
  fontSize: '5em',
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
  <div style={cardStyle}>{props.card.toString()}</div>
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
  <div style={{flexGrow: 1}}>
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

const WinTableHeader = (props) => (
  <div style={{display: 'table-header-group'}}>
    <div style={{display: 'table-row'}}>
      <div style={cellStyle}></div>
      {props.bets.map(bet => <div style={cellStyle}>{bet}</div>)}
    </div>
  </div>
)

const cellStyle = {
  display   : 'table-cell',
  minWidth  : '3vw',
  textAlign : 'right'
}

const WinTableRow = (props) => (
  <div style={{display: 'table-row'}}>
    <div style={{...cellStyle, textAlign: 'left'}}>{props.win.description}</div>
    {props.bets.map(bet => <div style={cellStyle}>{Math.round(bet*props.win.multiplier,2)}</div>)}
  </div>
)

const WinTable = (props) => (
  <div style={{display: 'table'}}>
    <WinTableHeader bets={props.bets} />
    {map(props.wins, win => (<WinTableRow win={win} bets={props.bets} />))}
  </div>
)

const Game = (props) => (
  <div>
    <div>Money:&nbsp;{props.game.money}</div>
    <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
      <CardStack cards={props.game.remainingDeck} title="Deck" show={0} />
      <div style={{flexGrow: 1}}>
        <WinTable wins={props.wins} bets={props.bets} />
      </div>
    </div>
    <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
      <CardSet cards={props.game.hand} title="Hand" />
      <CardStack cards={props.game.left} title="Left" />
      <CardStack cards={props.game.right} title="Right" />
    </div>
  </div>
)

export default () => (
  <div>
    <Game game={game} wins={wins} bets={bets}/>
  </div>
)