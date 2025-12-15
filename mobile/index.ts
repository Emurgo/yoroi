// Set Buffer globally FIRST, before any other imports
// This ensures int64-buffer can detect Buffer when it loads
import './src/kernel/shims'

import messaging from '@react-native-firebase/messaging'
import {registerRootComponent} from 'expo'
import 'react-native-gesture-handler'

import App from './App'
import './src/kernel/logger/helpers/init-logger'
import {logger} from './src/kernel/logger/logger'

// Set background message handler
// Using default app instance - the deprecation warning is acceptable for now
// as the modular API may have initialization timing issues
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  logger.debug('Background message received', {remoteMessage})
})

registerRootComponent(App)
