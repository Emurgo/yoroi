# Metrics

Metrics feature uses Amplitude service to send analytics of the app.

## Preparation

To update the metrics with new Amplitude events, run script `metrics-pull`.
To check if all events are implemented in the codebase, run script `metrics-status`.

These scripts use an Amplitude provided wrapper called [ampli]('https://www.docs.developers.amplitude.com/data/sdks/ampli-overview). Configuration of the wrapper can be found in `ampli.json`.
The underlying [sdk]('https://www.docs.developers.amplitude.com/data/sdks/sdk-architecture) has minor changes depending on the platform. Refer to the [react-native]('https://www.docs.developers.amplitude.com/data/sdks/typescript-react-native') one for mobile details.

When you run the scripts for the first time, it will ask you to login the cli with Amplitude credentials (opens browser).

## Usage

`initMetrics` must be called on app startup (`YoroiApp.tsx`)

Track or identify operations are done using the `metrics` object, and come with their typed methods from Amplitude definition:

```tsx
import {metrics} from './metrics'

metrics.nftGalleryDetailsNavigation({nft_navigation: 'Next'})
```

## Enable/disable and mock

Metrics can be enabled/disabled by the user (disabled by default until accepted via UI), with the current preference persisted on device.
Metrics can also be mocked via feature flag, for example to run in Storybook.
