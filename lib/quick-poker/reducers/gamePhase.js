import { CHOOSE, DEAL, FINISH_DEALING, NEW_ROUND, SHUFFLE } from '../actions/actionTypes';
import { CHOICE_MADE, DEALING, HAND_DEALT, PREPARE_SHUFFLING, ROUND_FINISHED, SHUFFLING } from '../gamePhases';
import { initialState } from '../initialState';

const phaseTransitions = [
  {action: NEW_ROUND,      currentPhase  : ROUND_FINISHED,     nextPhase : PREPARE_SHUFFLING },
  {action: SHUFFLE,        currentPhase  : PREPARE_SHUFFLING,  nextPhase : SHUFFLING },
  {action: DEAL,           currentPhase  : SHUFFLING,          nextPhase : DEALING },
  {action: FINISH_DEALING, currentPhase  : DEALING,            nextPhase : HAND_DEALT },
  {action: CHOOSE,         currentPhase  : HAND_DEALT,         nextPhase : CHOICE_MADE },
  {action: HANDLE_RESULT,  currentPhase  : CHOICE_MADE,        nextPhase : ROUND_FINISHED },
]

export const getGamePhase = state => state

export default gamePhase = (state = initialState.gamePhase, action) => {
  const {type} = action
  const [transition = false] = phaseTransitions.filter( transition => transition.action === type)
  if (!transition)  return state

  return transition.nextPhase
}