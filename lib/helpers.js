import {Joker} from './deck'

const hasJoker = (hand) => (hand.length > removeCard(hand, Joker).length)

const sameValue = (a,b) => (a.value === b.value || (a.value * b.value === 0)) // UNUSED
const sameSuit = (a,b) => (a.suit.short === b.suit.short || (a.value * b.value === 0))
const cardEquals = (a,b) => (sameValue(a,b) && sameSuit(a,b)) // UNUSED

const sameSuitCards = (deck, card) => 
	deck.filter( c => sameSuit(c, card))

const removeCard = (deck, card) =>
	deck.filter( (c) =>
		(c.suit !== card.suit) || (c.value !== card.value)
	)

const sortHand = (hand) => hand.sort((a,b) => {
  if (a.value < b.value) { return -1 }
  if (a.value > b.value) { return 1 }
  return 0
})

const distinctValuesCount = (hand) => countValues(hand).filter((count, value) => count > 0).length

const countValues = (hand) => {
  const valueCounts = Array.from({length: 15}, () => 0)
  hand.forEach(card => {
      valueCounts[card.value]++
    })
    return valueCounts
}

const productOfCardCounts = (hand) => (
  countValues(hand).filter( (count, value) => count > 0
  ).reduce( (acc, curr) => curr * acc, 1)
)

const logDeck = (deck, description='') => {
  console.log(description, deck.map(card => card.toString()+`(${card.value})`))
}

export {
    hasJoker,
    sameValue,
    sameSuit,
    cardEquals,
    sameSuitCards,
    removeCard,
    sortHand,
    distinctValuesCount,
    countValues,
    productOfCardCounts,
    logDeck
}