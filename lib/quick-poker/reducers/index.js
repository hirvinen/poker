import { combineReducers }        from 'redux'
import createRestReducer          from './restReducer'
import * as actions               from '../actions/actionTypes'
import cards                      from './cards'
import resources                  from './resources'
import gamePhase                  from './gamePhase'
import { getRemainingJokerRounds, getWin } from '../selectors'

export const sliceReducers = {
  cards,
  resources,
  gamePhase,
}

const restReducer      = createRestReducer(sliceReducers)
const fullStateReducer = combineReducers(sliceReducers)

/*
  For some actions, slice reducers need access to other parts of state.
  It results some duplication of work, but it feels much cleaner to keep as much game
  business logic in the non-UI reducers and selectors, compared to adding slices of
  state or de facto state transformations to the actions themselves either in sagas or
  action creators.

  This way the only part of *game* logic that is outside of reducers / selectors is the
  necessarily impure random shuffling.
*/
export default quickPokerGame = (state, action) => {
  if (typeof state === 'undefined') return fullStateReducer(state)

  switch (action.type) {
  case actions.NEW_ROUND:
    return restReducer(state, action, {
      cards: cards(state.cards, action, {jokerRounds: getRemainingJokerRounds(state)})
    })
  case actions.CHOOSE:
    // resources reducer needs to know about cards
    const newCards = cards(state.cards, action)
    return restReducer(state, action, {
      cards     : newCards,
      resources : resources(state.resources, action, {
        win: getWin({cards: newCards})
      })
    })
  default:
    return fullStateReducer(state, action)
  }
}