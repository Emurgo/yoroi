// @flow
import thunk from 'redux-thunk'
import {createStore, applyMiddleware, compose} from 'redux'
import {createLogger} from 'redux-logger'
import rootReducer from './rootReducer'
import getInitialState from '../state'

export default () => {
  const logger = {
    log: (message: string, payload: Object) => null,
  }

  const loggerMiddleware = createLogger({
    collapsed: true,
    predicate: (getState, action) => !action.doNotLog,
  })

  const middlewares = [thunk.withExtraArgument({logger})]
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware)
  }

  // When not running devtools, use regular compose
  const composeEnhancers =
    (window.__DEV__ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose

  const store = createStore(
    rootReducer,
    getInitialState(),
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
