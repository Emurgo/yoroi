// eslint-disable-file import/order
// prettier-ignore
import {registerRootComponent} from 'expo'
import 'react-native-gesture-handler'

// must be first - modals require it again (android)
import './src/kernel/logger/helpers/init-logger'
import './src/kernel/shims'

import App from './App'


registerRootComponent(App)
