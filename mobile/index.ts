/* prettier-ignore-file */
import messaging from "@react-native-firebase/messaging";
import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import "./src/kernel/logger/helpers/init-logger";
import "./src/kernel/shims";

import App from "./App";

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

registerRootComponent(App);
