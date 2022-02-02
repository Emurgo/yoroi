## fastlane documentation

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios staging

```sh
[bundle exec] fastlane ios staging
```

Push a new staging build to TestFlight

### ios nightly

```sh
[bundle exec] fastlane ios nightly
```

Push a new nightly build to TestFlight

### ios mainnet

```sh
[bundle exec] fastlane ios mainnet
```

Push a new mainnet build to TestFlight

### ios build

```sh
[bundle exec] fastlane ios build
```

Builds the project. Useful to verify a succesful compilation.

---

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
