import React from 'react'
import {Provider} from 'react-redux'

import configureStore from '../../src/legacy/configureStore.js'

const store = configureStore(true)

export const withRedux = (story) => <Provider store={store}>{story()}</Provider>
