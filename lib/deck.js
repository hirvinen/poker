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

export {
  Joker,
  createDeck
}