# Description

How to run the e2e tests?

The framework used is detox + jest. 

Pre-requisite is that you were able to build the local versions of the Yoroi mobile application for the iOS and Android platforms.

There are several scripts for running the tests in different modes like the nightly or dev builds. We will discuss taking the example of nightly:debug version here.

## MacOS
Set up the simulator device using Xcode. Preferably set up iPhone 14 with lates iOS version 
Run `e2e:build:ios:nightly:debug` to build and install the app to simulator
Run `e2e:test:ios:nightly:debug` to execute the tests. You can find the tests in `packages/e2e/tests/_ios`

## Android
Set up the virtual device device using Android Studio. Preferably set up Pixel6 with API level 31. Name the device as Pixel_6
Run `e2e:build:android:nightly:debug` to build and install the app to simulator
Run `e2e:test:android:nightly:debug` to execute the tests. You can find the tests in `packages/e2e/tests/_ios`
