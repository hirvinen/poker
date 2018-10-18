import * as actions   from '../actions/actionTypes'
import * as fromDeck  from '../deck'
import classify       from '../../classify'
import * as wins      from '../wins'

// This is mostly relevant to UI. TODO: Clean way to lift this out of here?
const JOKER_NOT_IN_PLAY   = 'JOKER_NOT_IN_PLAY'
const JOKER_ADDED         = 'JOKER_ADDED'
const JOKER_IN_PLAY       = 'JOKER_IN_PLAY'
const JOKER_REMOVED       = 'JOKER_REMOVED'

export const jokerStates  = {
  JOKER_NOT_IN_PLAY,
  JOKER_ADDED,
  JOKER_IN_PLAY,
  JOKER_REMOVED,
}

const joker = (state, action, args) => {
  switch (action.type) {
  case actions.NEW_ROUND:
    return state === JOKER_IN_PLAY && args.jokerRounds === 0
      ? JOKER_REMOVED
      : state
  case actions.SHUFFLE:
    switch (state) {
    case JOKER_ADDED    : return JOKER_IN_PLAY
    case JOKER_REMOVED  : return JOKER_NOT_IN_PLAY
    default             : return state
    }
  case actions.CHOOSE:
    return state === JOKER_NOT_IN_PLAY && args.win.multiplier >= 11
      ? JOKER_ADDED
      : state
  default: return state
  }
}

// used by selectors or reducers , state really only needs deck indices and win classes
const deck        = [...fromDeck.createDeck(), {...fromDeck.Joker}]
const jokerIndex  = deck.length - 1
const allWins     = {...wins.wins, none: wins.nullWin}
const dummyDeck   = Array.from(
  {length: deck.length},
  (_, index)  => ({...fromDeck.createDummyCard(index), classes: ['deck']})
)

const dummySets   = {
  deal          : dummyDeck.slice(0,  8),
  deck          : dummyDeck.slice(8, -1),
  deckWithJoker : dummyDeck.slice(8),
  initialCards  : [
    ...dummyDeck.slice(0,-1),
    {...fromDeck.Joker, classes: [JOKER_NOT_IN_PLAY]}
  ]
}

const mapDealToCards  = state => state.deal.map( index => ({
  ...(deck[index])
}))

// Selectors
export const getCards = state => {
  // initial state
  if (state.deal.length === 0) return dummySets.initialCards

  const currentDeck    = state.joker === JOKER_IN_PLAY
    ? dummySets.deckWithJoker
    : dummySets.deck

  return [
    ...getDealCards(state),
    ...currentDeck
  ]
}

const getDealCards = state => {
  const dealCards = mapDealToCards(state).map( (card, index) => {
    if (index < 2) return {...card, classes: ['table']}
    if (index < 5) return {...card, classes: ['left']}
    return {...card, classes: ['right']}
  })
  
  const {choice = null } = state.choice
  if (choice === null) { // between shuffling and choice
    return dealCards
  }

  const [h0, h1, l0, l1, l2, r0, r1, r2]  = dealCards
  const hand        = [h0, h1]
  const handslices  = {
    left  : [l0, l1, l2],
    right : [r0, r1, r2],
  }
  const discard = choice === 'left'
    ? 'right'
    : 'left'

    
  const cardsAfterChoice = [
    ...hand,
    handslices[choice].map( card => ({ ...card, classes: [...classes, 'chosen'] })),
    handslices[discard].map( card => ({ ...card, classes: [...classes, 'discarded'] })),
  ]
  // Joker could be removed while it is included in the deal
  if ( state.deal.includes(jokerIndex) && state.joker === JOKER_REMOVED ) {
    return cardsAfterChoice.map( card => {
      if (card.id !== fromDeck.Joker.id) return card

      return {
        ...card,
        classes: [...classes, JOKER_REMOVED],
      }
    })
  }

  // Add or remove Joker that was not in the deal if appropriate
  return addOrRemoveJoker = state.joker === JOKER_ADDED || state.joker === JOKER_REMOVED
    ? [ ...cardsAfterChoice, [{ ...fromDeck.Joker, classes = [state.joker] }] ]
    : cardsAfterChoice
}

const getHand      = state => getDealCards(state).slice(0,5)
const getHandClass = state => classify(getHand(state))
export const getWin       = state => allWins[getHandClass(state)]


export default cards = (
  state = {
    deal    : [],
    choice  : null,
    joker   : JOKER_NOT_IN_PLAY,
  },
  action,
  args
) => {
  switch (action.type) {
  case actions.NEW_ROUND:
    const jokerNewRound = joker(state.joker, action, args.jokerRounds)
    return jokerNewRound === state.joker
      ? state
      : {...state, joker: jokerNewRound}
  case actions.SHUFFLE:
    return {
      ...state,
      choice: null,
      deal  : (state.joker === JOKER_IN_PLAY || state.joker === JOKER_ADDED
        ? action.payload.deal.slice(0,8)
        : action.payload.deal
          .filter( deckIndex => deckIndex < jokerIndex)
          .slice(0, 8)
      ),
      joker: joker(state.joker, action),
    }
  case actions.CHOOSE:
    const {choice} = action.payload
    if (choice !== 'left' || choice !== 'right') throw Error(`Invalid choice ${choice}`)
    return {
      ...state,
      choice,
      joker: joker(state.joker, action, {win: getWin({...state, choice})}),
    }
  case actions.ADD_JOKER_ROUNDS:
    return state.joker === JOKER_ADDED || state.joker === JOKER_IN_PLAY
      ? state
      : {...state, joker: JOKER_ADDED}
  default:
    return state
  }
}