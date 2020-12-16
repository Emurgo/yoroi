fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## iOS
### ios staging
```
fastlane ios staging
```
Push a new staging build to TestFlight
### ios nightly
```
fastlane ios nightly
```
Push a new nightly build to TestFlight
### ios mainnet
```
fastlane ios mainnet
```
Push a new mainnet build to TestFlight
### ios build
```
fastlane ios build
```
Builds the project. Useful to verify a succesful compilation.

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
