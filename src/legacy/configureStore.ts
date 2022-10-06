/* eslint-disable @typescript-eslint/no-explicit-any */
import {action as storybookAction} from '@storybook/addon-actions'
import {applyMiddleware, compose, createStore} from 'redux'
import {createLogger} from 'redux-logger'
import thunk from 'redux-thunk'

import type {Dispatch, GenericAction} from './reduxTypes'
import rootReducer from './rootReducer'
import type {State} from './state'
import {getInitialState, mockState} from './state'

export const getConfiguredStore = (useMockState = false, storybook = false, mockedState?: null | any) => {
  const logger = {
    log: (_message: string, _payload: Record<string, unknown>) => null,
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
  const composeEnhancers = ((window as any).__DEV__ && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

  const store = createStore<State, GenericAction<State, any>, Dispatch, unknown>(
    rootReducer,
    __DEV__ && useMockState ? mockState(mockedState) : getInitialState(),
    composeEnhancers(applyMiddleware(...middlewares)),
  )

  if (process.env.NODE_ENV === 'development') {
    logger.log = (message: string, payload: Record<string, unknown>) =>
      store.dispatch({
        type: message,
        payload,
      }) as any
  }

  return store
}

export default getConfiguredStore
