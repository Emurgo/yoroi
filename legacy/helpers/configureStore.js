// @flow

import {action as storybookAction} from '@storybook/addon-actions'
import {applyMiddleware, compose, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunk from 'redux-thunk'

import type {State} from '../state'
import getInitialState, {mockState} from '../state'
import type {Dispatch, GenericAction} from '../types/reduxTypes'
import rootReducer from './rootReducer'

export const getConfiguredStore = (useMockState: boolean = false, storybook: boolean = false, mockedState: ?State) => {
  const logger = {
    log: (_message: string, _payload: Object) => null,
  }

  const loggerMiddleware = createLogger({
    collapsed: true,
    predicate: (getState, action) => !action.doNotLog,
  })

  const middlewares = [thunk.withExtraArgument({logger})]
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware)
  }
  if (storybook) {
    middlewares.push(() => (next) => (action) => {
      storybookAction('dispatch')(action)

      return next(action)
    })
  }

  // When not running devtools, use regular compose
  const composeEnhancers = (window.__DEV__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

  const store = createStore<State, GenericAction<State, any>, Dispatch>(
    rootReducer,
    __DEV__ && useMockState ? mockState(mockedState) : getInitialState(),
    composeEnhancers(applyMiddleware(...middlewares)),
  )

  if (process.env.NODE_ENV === 'development') {
    logger.log = (message: string, payload: Object) =>
      store.dispatch({
        type: message,
        payload,
      })
  }

  return store
}

export default getConfiguredStore
