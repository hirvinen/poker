//export const START_GAME       = 'START_GAME'  // Should this be an action?
// user dispatched actions
export const NEW_ROUND        = 'NEW_ROUND'
export const CHOOSE           = 'CHOOSE'
export const ADD_JOKER_ROUNDS = 'ADD_JOKER_ROUNDS'
export const ADD_MONEY        = 'ADD_MONEY'
export const INCREASE_BET     = 'INCREASE_BET'

// actions dispatched by sagas, in response to action indicated by comment
export const SHUFFLE          = 'SHUFFLE'         // NEW_ROUND, with delay
export const DEAL             = 'DEAL'            // SHUFFLE, with delay
export const FINISH_DEALING   = 'FINISH_DEALING'  // DEAL, with delay
//export const ANALYZE_CHOICES        = 'ANALYZE_CHOICES'     // DEAL (not used yet)
export const ANALYZE_RESULT   = 'ANALYZE_RESULT'  // CHOOSE, with delay
export const HANDLE_RESULT    = 'HANDLE_RESULT'   // ANALYZE_RESULT