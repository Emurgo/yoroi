/* prettier-ignore-file */
import { registerRootComponent } from "expo";
import "react-native-gesture-handler";
import "./src/kernel/logger/helpers/init-logger";
import "./src/kernel/shims";

import App from "./App";

registerRootComponent(App);
