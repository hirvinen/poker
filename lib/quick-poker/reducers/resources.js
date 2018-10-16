import {
  NEW_ROUND,
  INCREASE_BET,
  HANDLE_RESULT,
  ADD_MONEY,
  ADD_JOKER_ROUNDS
} from '../actions/actionTypes'
import { initialState, initialBet } from '../initialState';

let bet = initialBet

export const getBet = state => ({
  betValue  : state.betValue,
  betIndex  : state.betIndex,
})

export const getBetIndex = state => state.betIndex

export const getJokerRounds = state => state.jokerRounds
export const getMoney       = state => state.money

export default resources = (state = initialState.resources, action) => {
  const { type, payload } = action

  switch (type) {
  case NEW_ROUND:
    return {
      ...state,
      money: state.money - state.betValue,
    }
  case INCREASE_BET:
    bet = bet.increment().limit(state.money)
    const value = bet.value
    const index = bet.index
    if (value !== state.betValue || index !== state.betIndex) {
      return {
        ...state,
        betValue: value,
        betIndex: index,
      }
    }

    return state
  case HANDLE_RESULT:
    const { win, jokerInDeck }  = payload
    const { multiplier = 0 }    = win
    const money                 = state.betValue * multiplier + state.money
    bet                         = bet.limit(money)
    const betValue              = bet.value
    const betIndex              = bet.index
    const jokerRounds = (multiplier >= 11 && !jokerInDeck)
      ? 10
      : jokerRounds
    const newState = {
      money,
      betValue,
      betIndex,
      jokerRounds
    }
    const 
    const changeCount = Object.keys(newState).filter(
      key => newState[key] !== state[key]
    ).length
    return changeCount === 0
      ? state
      : {...state, ...newState}
  case ADD_MONEY:
    const { amount } = payload
    return {
      ...state,
      money: state.money + amount
    }
  case ADD_JOKER_ROUNDS:
    const { amount } = payload
    return {
      ...state,
      jokerRounds: state.jokerRounds + amount
    }
  default:
    return state
  }
}