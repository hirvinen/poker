import {delay} from 'redux-saga'
import { put, takeEvery, all, call } from 'redux-saga/effects'
import {
  NEW_ROUND,
  SHUFFLE,
  DEAL,
  FINISH_DEALING,
  CHOOSE,
  HANDLE_RESULT,
  ANALYZE_RESULT,
} from './actions/actionTypes'
import * as actions from './actions'
import { getHand, getBetIndex, getRemainingJokerRounds, getWin, getJokerInDeck } from './reducers'

/*
  TL;DR: Actions result in other actions according to watcherDefinitions
*/

const defaultDelay = 1000

const shuffle = function* (time = defaultDelay) {
  yield call(delay, time)
  yield put(actions.shuffle())
}

// arg : defaultValue
const delayedSagaDefinition = {
  delayLength: defaultDelay,
}

const watcherDefinitions = [
  { trigger: NEW_ROUND,       saga      : shuffle,        sagaDefinition: delayedSagaDefinition },
  { trigger: SHUFFLE,         response  : DEAL,           sagaDefinition: delayedSagaDefinition },
  { trigger: DEAL,            response  : FINISH_DEALING, sagaDefinition: delayedSagaDefinition },
]

const generateSaga = (response, sagaDefinition) => {
  const {delayLength, payload} = sagaDefinition

  return function* () {
    // Inject name into scope to aid debugging since the funcion itself is anonymous
    const name = `dispatch${response}Saga`
    if (delayLength) yield call(delay, delayLength)
    yield put(action(response, payload))
  }
}

const generateWatcher = (watcher = {}) => {
  const {trigger, response, saga: givenSaga, sagaDefinition} = watcher
  const saga = givenSaga || generateSaga(response, sagaDefinition)

  return function* () {
    // Inject name into scope to aid debugging since the funcion itself is anonymous
    const name = `watch${trigger}`
    yield takeEvery(trigger, saga)
  }
}

const watchers = watcherDefinitions.map(
  watcherDefinition => generateWatcher(watcherDefinition)
)

export default function* rootSaga() {
  yield all(watchers.map( watcher => watcher()))
}