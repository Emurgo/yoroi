// eslint-disable-file import/order
import 'react-native-gesture-handler' // must be first - modals require it again (android)
import './src/kernel/logger/helpers/init-logger'
import './src/kernel/shims'

import {registerRootComponent} from 'expo'

import App from './App'

registerRootComponent(App)
