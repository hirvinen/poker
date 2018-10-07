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
  toString: () => suit.symbol + cardLetterMap[value],
  get id () {
    return `card-${suit.name}-${value}`
  }
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
    short: 'J',
    color: 'joker'
  },
  value : 0,
  toString : () => ('🃏'),
  get id () {
    return 'card-joker'
  }
}

const pickCards = (deck, count) => ({
  picked: deck.slice( 0, count),
  rest: deck.slice(count, deck.length)
})

// Not used, but kept here for possible future use
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

export {
  Joker,
  createDeck
}