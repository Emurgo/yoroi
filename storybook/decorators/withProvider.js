// @flow

import type {Node} from 'react'
import React from 'react'
import {Provider} from 'react-redux'

import configureStore from '../../legacy/helpers/configureStore.js'

const store = configureStore(true)

export const withProvider = (story: () => Node) => <Provider store={store}>{story()}</Provider>
