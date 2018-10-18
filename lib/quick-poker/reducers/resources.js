import * as actions     from '../actions/actionTypes'

// selectors
// jokerRounds < 0 means that joker was not in play on current round
export const getRemainingJokerRounds = state => Math.max(state.jokerRounds, 0)
export const getMoney       = state => state.money
export const getCurrentBet  = state => state.currentBet
export const getLastBet     = state => state.lastBet

// reducer helpers
const minBet    = 1
const maxBet    = 5

const limitBet  = state => {
  const { money, currentBet } = state
  return (money < minBet)
    ? minBet
    : Math.min(Math.floor(money), currentBet)
}

const incrementBet = state => {
  const { currentBet } = state
  return limitBet({
    ...state,
    currentBet: ( currentBet + increment ) % ( maxBet + 1 )
  })
}

const jokerRoundsAfterWin = (jokerRounds, win) =>
  (jokerRounds < 0 && win.multiplier >= 11)
    ? 10
    : jokerRounds

export default resources = (
  state = {
    money       : 20,
    jokerRounds : -1, // < 0 means that joker was not in play on current round
    currentBet  : 1,
    lastBet     : 1,
  },
  action,
  args
) => {
  switch (action.type) {
  case actions.NEW_ROUND:
    return {
      ...state,
      money       : state.money - state.currentBet,
      lastBet     : state.currentBet,
      jokerRounds : Math.max(state.jokerRounds - 1, -1)
    }

  case actions.INCREASE_BET:
    const newBet = incrementBet(state)
    return newBet === state.currentBet
      ? state
      : {...state, currentBet: newBet}
  case actions.CHOOSE:
    const { win }  = args
    return win.multiplier === 0 && state.currentBet <= state.money
      ? state
      : {
        ...state,
        money       : state.money + state.currentBet * win.multiplier,
        currentBet  : limitBet(state),
        jokerRounds : jokerRoundsAfterWin(state.jokerRounds, win)
      }
  case actions.ADD_MONEY:
    return {
      ...state,
      money: state.money + action.payload.amount
    }
  case actions.ADD_JOKER_ROUNDS:
    return {
      ...state,
      jokerRounds: Math.max(state.jokerRounds,0) + action.payload.amount
    }
  default:
    return state
  }
}