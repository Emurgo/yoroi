// eslint-disable-file import/order
import './src/kernel/logger/helpers/init-logger'
import './src/kernel/shims'

import {registerRootComponent} from 'expo'

import App from './App'

registerRootComponent(App)
