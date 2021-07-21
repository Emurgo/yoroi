// @flow
import React from 'react'
import {Provider} from 'react-redux'

import configureStore from '../src/helpers/configureStore.js'

import type {Node} from 'react'

const store = configureStore(true)

export const withProvider = (story: () => Node) => <Provider store={store}>{story()}</Provider>
