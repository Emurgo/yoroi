// @flow

import type {State} from '../state'
import getInitialState from '../state'
import type {GenericAction} from '../types/reduxTypes'
import {forwardReducerTo} from './utils'

const rootReducer = <Payload>(state: State = getInitialState(), action: GenericAction<State, Payload>) => {
  const {reducer, path, payload} = action
  // fallback for 3rd-party actions
  if (!reducer) return state
  return forwardReducerTo<State, Payload>(reducer, path)(state, payload)
}

export default rootReducer
