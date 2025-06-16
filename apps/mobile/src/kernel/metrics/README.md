# Metrics

Metrics feature uses Amplitude service to send analytics of the app.

## Preparation

To update the metrics with new Amplitude events, run script `metrics:pull`.
To check if all events are implemented in the codebase, run script `metrics:status`.

**The status script does static analysis of the code, so it needs the usage to be `ampli.XXX`**

If prompted which region to use, select `us`.

These scripts use an Amplitude provided wrapper called [ampli]('https://www.docs.developers.amplitude.com/data/sdks/ampli-overview'). Configuration of the wrapper can be found in `ampli.json`.
The underlying [sdk]('https://www.docs.developers.amplitude.com/data/sdks/sdk-architecture') has minor changes depending on the platform. Refer to the [react-native]('https://www.docs.developers.amplitude.com/data/sdks/typescript-react-native') one for mobile details.

When you run the scripts for the first time, it will ask you to login the cli with Amplitude credentials (opens browser).

## Usage

`YoroiApp.tsx` must be wrapped within the (`MetricsProvider`).

Track operations are done using the `track` object that is an adapter for the typed methods from Amplitude definition:

```jsx
import {useMetrics} from './metricsManager'
const Component = () => (
    const {track} = useMetrics()
    const handleX = () => track.nftGalleryDetailsNavigation({nft_navigation: 'Next'})
    <>
        ...
    </>
)
```

## Enable/disable and mock

Metrics can be enabled/disabled by the user (disabled by default until accepted via UI), with the current preference persisted on device.
Metrics can also be mocked via `./mocks` for Storybooks and Tests
Metrics for are behind a feature flag

## Updating

Manager is responsible for adapting the analytics module into Yoroi, whenever there are new events it needs to be mapped 1:1 in the module.
Also if a method from `ampli` needs to be exposed it should be wrapped within the manager as well i.e. `Identify`
