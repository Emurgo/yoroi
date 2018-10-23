// @flow
import {forwardReducerTo} from './utils'
import getInitialState from '../state'

import type {GenericAction} from '../types/reduxTypes'
import type {State} from '../state'

const rootReducer = (
  state: State = getInitialState(),
  action: GenericAction<*, *>,
) => {
  const {reducer, path, payload} = action
  // fallback for 3rd-party actions
  if (!reducer) return state
  return forwardReducerTo(reducer, path)(state, payload)
}

export default rootReducer
