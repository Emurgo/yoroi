// @flow

import * as React from 'react'
import {Provider} from 'react-redux'
import configureStore from '../src/helpers/configureStore'

export const ReduxProvider = ({children}: {children: React$Node}) => (
  <Provider store={configureStore(true)}>{children} </Provider>
)
