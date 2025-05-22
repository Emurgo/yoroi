import { freeze } from "immer";
import { Platform } from "react-native";
import * as Device from "expo-device";

import { isNightly, isProduction } from "./env";

const environment = isNightly
  ? "nightly"
  : isProduction
  ? "production"
  : "development";
const version = Device.osVersion ?? "";
const release = isProduction ? version : "dev";
const build = Device.osBuildId;
const distribution = `${Platform.OS}.${build}`;

export const appInfo = freeze({
  environment,
  version,
  release,
  build,
  distribution,
});
