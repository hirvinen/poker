import {
  NEW_ROUND,
  CHOOSE,
  ADD_JOKER_ROUNDS,
  ADD_MONEY,
  INCREASE_BET,
  SHUFFLE,
  DEAL,
  FINISH_DEALING, 
  ANALYZE_RESULT,
  HANDLE_RESULT
} from './actionTypes'
import { getUniqueIntArray } from '../../helpers'

export const action = (type, payload) => {
  return ( typeof payload === 'undefined' )
    ? {type}
    : {type, payload}
}

export const newRound       = ()              => action(NEW_ROUND)
export const increaseBet    = ()              => action(INCREASE_BET)
export const shuffle        = ()              => action(SHUFFLE, {deal: getUniqueIntArray(9, 52)})
export const deal           = ()              => action(DEAL)
export const finishDealing  = ()              => action(FINISH_DEALING)
export const choose         = (choice = null) => action(CHOOSE, {choice})
export const addJokerRounds = (amount = 10)   => action(ADD_JOKER_ROUNDS, {amount})
export const addMoney       = (amount = 10)   => action(ADD_MONEY, {amount})
export const analyzeResult  = ({hand, betIndex}) =>
  action(ANALYZE_RESULT, {hand, betIndex})
export const handleResult   = ({win, jokerRounds, jokerInDeck}) =>
  action(HANDLE_RESULT, {win, jokerRounds, jokerInDeck})