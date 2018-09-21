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

const roundToPrecision   = (number, precision=0) => Math.round(number * 10**precision)/(10**precision)

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
    logDeck,
    roundToPrecision,
    createBet,
    getKeyboardHandler,
}