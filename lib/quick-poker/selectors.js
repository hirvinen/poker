import { initialState, deck } from './initialState'

export const getCards = (state = initialState) => ({
  cards: state.cards
})