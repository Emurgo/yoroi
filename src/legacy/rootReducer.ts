import type {State} from '../../legacy/state'
import {getInitialState} from '../../legacy/state'
import type {GenericAction} from '../../legacy/types/reduxTypes'
import {forwardReducerTo} from './utils'

const rootReducer = <Payload>(state: State = getInitialState(), action: GenericAction<State, Payload>) => {
  const {reducer, path, payload} = action
  // fallback for 3rd-party actions
  if (!reducer) return state
  return forwardReducerTo<State, Payload>(reducer, path)(state, payload)
}

export default rootReducer
