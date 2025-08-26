fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### set_version_ios

```sh
[bundle exec] fastlane set_version_ios
```



### set_version_android

```sh
[bundle exec] fastlane set_version_android
```



### upload_ios_nightly_ipa

```sh
[bundle exec] fastlane upload_ios_nightly_ipa
```

Upload existing iOS nightly IPA to TestFlight

----


## Android

### android nightly

```sh
[bundle exec] fastlane android nightly
```

Deploy Nightly to Internal Testing

### android production

```sh
[bundle exec] fastlane android production
```

Deploy Production to Play Store

### android nightly_local

```sh
[bundle exec] fastlane android nightly_local
```

Publish locally built Android nightly to Internal Testing

### android production_local

```sh
[bundle exec] fastlane android production_local
```

Publish locally built Android production to Play Store

----


## iOS

### ios nightly

```sh
[bundle exec] fastlane ios nightly
```

Deploy Nightly to TestFlight

### ios production

```sh
[bundle exec] fastlane ios production
```

Deploy Production to App Store

### ios nightly_local

```sh
[bundle exec] fastlane ios nightly_local
```

Publish locally built iOS nightly to TestFlight

### ios production_local

```sh
[bundle exec] fastlane ios production_local
```

Publish locally built iOS production to App Store

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
