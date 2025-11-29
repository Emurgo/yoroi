import messaging from '@react-native-firebase/messaging'
import {registerRootComponent} from 'expo'
import 'react-native-gesture-handler'

import App from './App'
import './src/kernel/logger/helpers/init-logger'
import {logger} from './src/kernel/logger/logger'
import './src/kernel/shims'

// Set background message handler
// Using default app instance - the deprecation warning is acceptable for now
// as the modular API may have initialization timing issues
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  logger.debug('Background message received', {remoteMessage})
})

registerRootComponent(App)
