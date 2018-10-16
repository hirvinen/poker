import { SHUFFLE, CHOOSE, HANDLE_RESULT, ADD_JOKER_ROUNDS } from '../actions/actionTypes'
import { initialState } from '../initialState'
import {createDeck, Joker}  from '../deck'

export const deck = [...createDeck(), {...Joker}]

export const getCards = (state, cardFilter) => {
  const indices = jokerInDeck
    ? state.deal
    : state.deal.filter( index => index !== (deck.length - 1) )
  const cards = indices.map( index => ({
    ...(deck[index])
  }))
  const { choice } = state
  const [h0, h1, l0, l1, l2, r0, r1, r2]  = cards
  switch (cardFilter) {
  case 'hand':
    if (choice === 'left')  return [h0, h1, l0, l1, l2]
    if (choice === 'right') return [h0, h1, r0, r1, r2]
    return [h0, h1]
  case 'left':
    return [l0, l1, l2]
  case 'right':
    return [r0, r1, r2]
  default:
    return cards
  }
}

export const getHand  = state => getCards(state, 'hand')
export const getLeft  = state => getCards(state, 'left')
export const getRight = state => getCards(state, 'right')

export default cards = (state = initialState.cards, action) => {
  const { type, payload } = action
  const { jokerInDeck }   = state

  switch (type) {
  case SHUFFLE:
    const {deal} = payload
    return {...state, deal, choice: null}
  case CHOOSE:
    const {choice} = payload
    if (choice !== 'left' || choice !== 'right') throw Error(`Invalid choice ${choice}`)
    return {...state, choice}
      case HANDLE_RESULT:
    const { win, jokerRounds } = payload
    if (jokerInDeck && jokerRounds === 0) {
      return {...state, jokerInDeck: false}
    }
    if (!jokerInDeck && win.multiplier >= 11) {
      return {...state, jokerInDeck: true}
    }

    return state
  case ADD_JOKER_ROUNDS:
    if (!jokerInDeck) return {...state, jokerInDeck: true}

    return state
  default:
    return state
  }
}