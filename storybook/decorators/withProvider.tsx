import * as React from 'react'
import {Provider} from 'react-redux'

import configureStore from '../../legacy/helpers/configureStore.js'

const store = configureStore(true)

export const withProvider = (story: () => React.ReactNode) => <Provider store={store}>{story()}</Provider>
