import { NEW_ROUND, ANALYZE_RESULT }  from '../actions/actionTypes'
import { classify }                   from '../../classify'
import { wins, nullWin }              from '../wins'
import { initialState }               from '../initialState'

export const getWin = state => {
  return state.result in wins
    ? {...wins[state.result]}
    : {...nullWin}
}

export default result = (state = initialState.result, action) => {
  const { type, payload } = action
  switch (type) {
  case NEW_ROUND:
    return {...initialState.result}
  case ANALYZE_RESULT:
    const { hand, betIndex } = payload
    return {
      result      : classify(hand),
      lastBetIndex: betIndex,
    }
  }
}