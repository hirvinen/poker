/*
  Compare state and stateFragment. If the slices are ===, return original state.
  If stateFragment is missing some slices, apply slice reducers to those,
  and compare the combined new state instead, returning original state if they are === equal
*/
export default createRestReducer = sliceReducers => (
  state,
  action,
  stateFragment = {}
) => {
  const slices = Object.keys(state)
  const changed = {}
  slices.forEach(sliceKey => {
    const slice = state[sliceKey]
    const sliceReducer = sliceReducers[sliceKey]
    const newSlice =
      sliceKey in stateFragment
        ? stateFragment[sliceKey]
        : sliceReducer(slice, action)
    if (slice !== newSlice) {
      changed[sliceKey] = newSlice
    }
  })
  return Object.keys(changed).length === 0 ? state : { ...state, ...changed }
}
