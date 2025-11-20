/* prettier-ignore-file */
import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import "./src/kernel/logger/helpers/init-logger";
import "./src/kernel/shims";

import messaging from "@react-native-firebase/messaging";
import App from "./App";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.debug('Background message received:', remoteMessage);
});

registerRootComponent(App);
