import cards,     * as fromCards      from './cards'
import resources, * as fromResources  from './resources'
import result,    * as fromResult     from './result'
import gamePhase, * as fromGamePhase  from './gamePhase'

// cards
export const getCards       = state => fromCards.getCards(state.cards)
export const getHand        = state => fromCards.getHand(state.cards)
export const getLeft        = state => fromCards.getLeft(state.cards)
export const getRight       = state => fromCards.getRight(state.cards)
// resources
export const getBet         = state => fromResources.getBet(state.resources)
export const getBetIndex    = state => fromResources.getBetIndex(state.resources)
export const getJokerRounds = state => fromResources.getJokerRounds(state.resources)
export const getMoney       = state => fromResources.getMoney(state.resources)
// result
export const getWin         = state => fromResult.getWin(state.result)
// gamePhase
export const getGamePhase   = state => fromGamePhase.getGamePhase(state.gamePhase)

export default {
  cards,
  resources,
  result,
  gamePhase,
}