import {createBet}          from '../helpers'
import { nullWin }          from './wins'
const initialMoney = 100

export const initialBet = createBet()

export const initialState = {
  // affected by SHUFFLE, CHOOSE, HANDLE_RESULT, ADD_JOKER_ROUNDS
  // depends on: result and resources, handled by saga handleResult
  cards       : {
    deal       : [],
    choice     : null,
    jokerInDeck: false,
  },
  // affected by NEW_ROUND, INCREASE_BET, HANDLE_RESULT, ADD_MONEY, ADD_JOKER_ROUNDS
  // depends on: result, handled by saga handleResult
  resources   : {
    money       : initialMoney,
    betValue    : initialBet.value,
    betIndex    : initialBet.index,
    jokerRounds : 0,
  },
  // affected by NEW_ROUND, ANALYZE_RESULT
  // depends on: cards and resources, handled by saga analyzeResult
  result      : {
    result        : 'none',
    lastBetIndex  : initialBet.index,
  },
  // Affected by NEW_ROUND, SHUFFLE, DEAL, CHOOSE, ANALYZE_RESULT
  gamePhase   : 'roundFinished', 
}
