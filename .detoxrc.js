/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YOUR_APP.app',
      build: 'xcodebuild -workspace ios/emurgo.xcworkspace -scheme emurgo -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/YOUR_APP.app',
      build: 'xcodebuild -workspace ios/emurgo.xcworkspace -scheme emurgo -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.nightly.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/nightly/release/app-nightly-release.apk',
      build: 'cd android ; ENVFILE=.env.nightly ENTRY_FILE=index.ts ./gradlew clean assembleNightlyRelease assembleNightlyReleaseAndroidTest -DtestBuildType=release ; cd -'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 12'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'test'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.device.nightly.release': {
      device: 'attached',
      app: 'android.nightly.release'
    },
    'android.emu.nightly.release': {
      device: 'emulator',
      app: 'android.nightly.release'
    },
  }
};
