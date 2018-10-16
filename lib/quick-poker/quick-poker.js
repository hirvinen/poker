import { combineReducers }    from 'redux';
import {
  cards,
  resources,
  result,
  gamePhase
} from 'reducers';

export default quickPokerGame = combineReducers({
  cards,
  resources,
  result,
  gamePhase,
})