import * as actions from '../actions/actionTypes'
import {
  CHOICE_MADE,
  DEALING,
  HAND_DEALT,
  PREPARE_SHUFFLING,
  ROUND_FINISHED,
  SHUFFLING
} from '../gamePhases';

const phaseTransitions = [
  {action: actions.NEW_ROUND,      currentPhase  : ROUND_FINISHED,     nextPhase : PREPARE_SHUFFLING },
  {action: actions.SHUFFLE,        currentPhase  : PREPARE_SHUFFLING,  nextPhase : SHUFFLING },
  {action: actions.DEAL,           currentPhase  : SHUFFLING,          nextPhase : DEALING },
  {action: actions.FINISH_DEALING, currentPhase  : DEALING,            nextPhase : HAND_DEALT },
  {action: actions.CHOOSE,         currentPhase  : HAND_DEALT,         nextPhase : CHOICE_MADE },
  {action: actions.HANDLE_RESULT,  currentPhase  : CHOICE_MADE,        nextPhase : ROUND_FINISHED },
]

export const getGamePhase = state => state

export default gamePhase = (
  state = ROUND_FINISHED,
  action
) => {
  const [transition = false] = phaseTransitions.filter(
    transition => transition.action === action.type
  )
  if (!transition)  return state

  return transition.nextPhase
}