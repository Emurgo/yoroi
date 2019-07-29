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
or alternatively using `brew cask install fastlane`

# Available Actions
## Android
### android build
```
fastlane android build
```
Builds a release version
### android deploy_staging
```
fastlane android deploy_staging
```
Deploy a new staging (devRelease) version to Google Play
### android deploy_mainnet
```
fastlane android deploy_mainnet
```
Deploy an internal mainnet (mainRelease) version to Google Play
### android release_mainnet
```
fastlane android release_mainnet
```
Deploy and make available to everyone a new version (mainRelease) in Google Play

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
