import * as fromCards     from './reducers/cards'
import * as fromResources from './reducers/resources'
import * as fromGamePhase from './reducers/gamePhase'

// Global selectors
// cards
export const getCards       = state => fromCards.getCards(state.cards)
export const getWin         = state => fromCards.getWin(state.cards)
// resources
export const getCurrentBet            = state => fromResources.getCurrentBet(state.resources)
export const getLastBet               = state => fromResources.getLastBet(state.resources)
export const getRemainingJokerRounds  = state => fromResources.getRemainingJokerRounds(state.resources)
export const getMoney                 = state => fromResources.getMoney(state.resources)
// gamePhase
export const getGamePhase             = state => fromGamePhase.getGamePhase(state.gamePhase)
