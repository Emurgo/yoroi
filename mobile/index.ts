/* prettier-ignore-file */
import messaging from '@react-native-firebase/messaging';

// Register background message handler - MUST be at the top level
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('FCM: Message handled in the background!', remoteMessage);
});

import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import "./src/kernel/logger/helpers/init-logger";
import "./src/kernel/shims";

import App from "./App";

registerRootComponent(App);
