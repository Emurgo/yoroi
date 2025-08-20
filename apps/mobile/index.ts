// eslint-disable-file import/order
import {registerRootComponent} from 'expo'
import 'react-native-gesture-handler'

import App from './App'
// must be first - modals require it again (android)
import './src/kernel/logger/helpers/init-logger'
import './src/kernel/shims'

registerRootComponent(App)
