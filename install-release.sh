nvm i \
&& rm -rf node_modules \
&& yarn install \
&& yarn setup_configs \
&& . get_commit.sh \
&& npx jetifier \
&& (cd ios; pod install)

function ask() {
  read -p "$1 > " -r
  if [ -z "$2" ]
  then
    echo $REPLY;
  else
    PATTERN="^$2$"
    [[ $REPLY =~ $PATTERN ]]
  fi
}

function ask-yn() {
  ask "$1? (y/n)" "[Yy]"
}

function prompt() {
  if ! ask-yn "$1"
  then exit; fi
}

function bumpAndroid() {
  APP_GRADLE_FILE='android/app/build.gradle'
  TMP_FILE='zzzzz.tmp'

  VC='versionCode'
  VN='versionName'

  versionCode=$(grep "$VC " $APP_GRADLE_FILE | awk '{print $2}')
  versionName=$(grep "$VN " $APP_GRADLE_FILE | awk '{print $2}' | tr -d '"')
  nextVersionCode=$(($versionCode + 1))

  echo "Version code: ${versionCode}"
  echo "Next version code: ${nextVersionCode}"

  echo "Version name: ${versionName}"
  nextVersionName=$(ask "Next version name? (Skip to use same)")
  if [ -z ${nextVersionName} ]
  then nextVersionName=${versionName}; fi
  echo "Next version name: ${nextVersionName}"

  OLD_VC_LINE="$VC ${versionCode}"
  OLD_VN_LINE="$VN \\\"${versionName}\\\""
  VC_LINE="$VC ${nextVersionCode}"
  VN_LINE="$VN \\\"${nextVersionName}\\\""
  awk "{sub(/$OLD_VC_LINE/,\"$VC_LINE\")}1 {sub(/$OLD_VN_LINE/,\"$VN_LINE\")}1" $APP_GRADLE_FILE > $TMP_FILE && mv $TMP_FILE $APP_GRADLE_FILE

  echo "Bumped $APP_GRADLE_FILE"
}

function buildAndroid() {
  if ask-yn "Build nightly"
  then BUILD_TYPE="Nightly"; BUILD_DIR="nightly";
  elif ask-yn "Build prod"
  then BUILD_TYPE="Mainnet"; BUILD_DIR="mainnet";
  else echo "No build selected"; exit 1;
  fi

  prompt "Android : building gradle \"${BUILD_TYPE}\""

  (cd android; \
  ENTRY_FILE=index.ts ./gradlew clean "assemble${BUILD_TYPE}Release" \
  && open app/build/outputs/apk/${BUILD_DIR}/release)
}

function doAndroid() {

  if ask-yn "Android : bump"
  then bumpAndroid
  fi

  if ask-yn "Android : build"
  then buildAndroid
  fi
}

function doApple() {

  prompt "!!! Cannot bump iOS versions yet! You need to bump them manually. Proceed"

  if ask-yn "Build nightly"
  then BUILD_TYPE="nightly"; BUILD_DIR="nightly";
  elif ask-yn "Build prod"
  then BUILD_TYPE="mainnet"; BUILD_DIR="mainnet";
  else echo "No build selected"; exit 1;
  fi

  prompt "Apple : building fastlane \"${BUILD_TYPE}\""

  (cd ios; fastlane ios ${BUILD_TYPE})
}

if ask-yn "Do Android"
then doAndroid
fi

if ask-yn "Do Apple"
then doApple
fi