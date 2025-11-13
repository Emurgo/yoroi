### Analytics

Typed analytics utilities and PostHog wiring for the client app.

### Key pieces

- **Provider**: `AnalyticsRootProvider` exposes `enabled`, `setEnabled`, `capture`, `navigate`, `install`, `client`, `platform`.
- **Client**: `createPosthogClient` adapts `posthog-react-native` to the `AnalyticsProvider` interface.
- **Typed events**: Event names and properties live in `events/analytics-events.ts` and are enforced at compile time.
- **Hooks**:
  - `useAnalyticsTracking` → `trackEvent(event, properties?)`

### Setup

`PlatformShell` wraps the app with `AnalyticsRootProvider` and initializes PostHog.

- Required env vars:
  - `EXPO_PUBLIC_POSTHOG_KEY`
  - `EXPO_PUBLIC_POSTHOG_HOST`

If these are missing, analytics is disabled at runtime.

### Opt-in/Opt-out

Use the context to respect and toggle user consent. The value is persisted.

```tsx
import {useAnalyticsContext} from '~/features/Analytics/context/AnalyticsRootProvider'

export function AnalyticsToggle() {
  const {enabled, setEnabled} = useAnalyticsContext()
  return (
    <Switch value={enabled} onValueChange={setEnabled} />
  )
}
```

### Tracking page views

Track page views from screens using `useAnalyticsTracking`.

```tsx
import * as React from 'react'
import {View} from 'react-native'
import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'

export function PortfolioDashboardScreen() {
  const {trackEvent} = useAnalyticsTracking()
  React.useEffect(() => {
    trackEvent('Portfolio Dashboard Page Viewed')
  }, [trackEvent])
  return <View />
}
```

With properties (types enforced by the event definition):

```tsx
import * as React from 'react'
import {View} from 'react-native'
import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'

export function NftGalleryScreen({count}: {count: number}) {
  const {trackEvent} = useAnalyticsTracking()
  React.useEffect(() => {
    trackEvent('NFT Gallery Page Viewed', {nft_count: count})
  }, [trackEvent, count])
  return <View />
}
```

### Tracking events

Use the typed helper for button clicks, submissions, etc.

```tsx
import {useAnalyticsTracking} from '~/features/Analytics/hooks/useAnalyticsTracking'

export function ReviewTxSubmit({assetCount, assetList, type}: {
  assetCount: number
  assetList: string
  type: string
}) {
  const {trackEvent} = useAnalyticsTracking()

  const onOpen = () =>
    trackEvent('Transaction Review Modal Viewed', {
      asset_count: assetCount,
      asset_list: assetList,
      type,
    })

  return <Button title="Open" onPress={onOpen} />
}
```

All calls automatically include `platform`.

### Manual capture and navigation events

```tsx
import {useAnalyticsContext} from '~/features/Analytics/context/AnalyticsRootProvider'

const {capture, navigate} = useAnalyticsContext()

capture('Send Initiated')
navigate('Swap/Confirm')
```

### Identify and install attribution

`PlatformShell` identifies the device using an installation id. To identify a user or add traits:

```tsx
import {useAnalyticsContext} from '~/features/Analytics/context/AnalyticsRootProvider'

const {client} = useAnalyticsContext()
client?.identify('user-id-123', {plan: 'pro'})
```

To attribute installs and track an install event:

```tsx
import {useAnalyticsContext} from '~/features/Analytics/context/AnalyticsRootProvider'

const {install} = useAnalyticsContext()
install('summer-campaign', 'twitter')
```

### Adding new events

Add names and (optional) property types in `events/analytics-events.ts`. This makes them available to the hooks with full TypeScript support.

### Files of interest

- `context/AnalyticsRootProvider.tsx`
- `helpers/createPosthogClient.ts`
- `hooks/useAnalyticsTracking.ts`
- `events/analytics-events.ts`
- `types/analytics.ts`


