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
import { getHand, getBetIndex, getJokerRounds, getWin, getJokerInDeck } from './reducers'

/*
  TL;DR: Actions result in other actions according to watcherDefinitions
  Also some followup actions get certain parts of current state added to them
  1. ANALYZE_RESULT gets getHand(state),  getBetIndex(state) added to payload
  2. HANDLE_RESULT  gets getWin(state), getJokerInDek(state) and  getJokerRounds(state) added to payload
  3. SHUFFLE        gets 9 random deck indices

*/

const defaultDelay = 1000

const shuffle = function* (time = defaultDelay) {
  yield call(delay, time)
  yield put(actions.shuffle())
}

const analyzeResult = function* (time = defaultDelay) {
  yield call(delay, time)
  yield put(actions.analyzeResult({
    hand    : select(getHand),
    betIndex: select(getBetIndex),
  }))
}

const handleResult = function* () {
  yield put(handleResult())
  yield put(action(
    HANDLE_RESULT,
    {
      win         : select(getWin),
      jokerRounds : select(getJokerRounds),
      jokerInDeck : select(getJokerInDeck),
    }
  ))
}

// arg : defaultValue
const delayedSagaDefinition = {
  delayLength: defaultDelay,
}

const watcherDefinitions = [
  { trigger: NEW_ROUND,       saga      : shuffle,        sagaDefinition: delayedSagaDefinition },
  { trigger: SHUFFLE,         response  : DEAL,           sagaDefinition: delayedSagaDefinition },
  { trigger: DEAL,            response  : FINISH_DEALING, sagaDefinition: delayedSagaDefinition },
  { trigger: CHOOSE,          saga      : analyzeResult,  sagaDefinition: delayedSagaDefinition },
  { trigger: ANALYZE_RESULT,  saga      : handleResult},
]

const generateSaga = (response, sagaDefinition) => {
  const {delayLength, payload} = sagaDefinition

  return function* () {
    const name = `dispatch${response}Saga`
    if (delayLength) yield call(delay, delayLength)
    yield put(action(response, payload))
  }
}

const generateWatcher = (watcher = {}) => {
  const {trigger, response, saga: givenSaga, sagaDefinition} = watcher
  const saga = givenSaga || generateSaga(response, sagaDefinition)

  return function* () {
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