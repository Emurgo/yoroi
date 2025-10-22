# Disclaimer Component & Hook

This module provides a simple way to show disclaimer modals to users before they use certain features.

## Usage Patterns

### 1. Automatic Showing (Simple)

Use the `ShowDisclaimer` component to automatically show a disclaimer when a screen mounts:

```tsx
import { ShowDisclaimer } from '~/features/Legal/ui/shared/Disclaimer/ShowDisclaimer'

export const MyFeatureScreen = () => {
  return (
    <SafeArea>
      <ShowDisclaimer type="swap" />
      {/* Your screen content */}
    </SafeArea>
  )
}
```

With custom cancel handler:

```tsx
<ShowDisclaimer
  type="swap"
  onCancel={() => navigation.goBack()}
/>
```

### 2. Manual Control (Advanced)

Use the `useDisclaimer` hook when you need more control over when to show the disclaimer:

```tsx
import { useDisclaimer } from '~/features/Legal/ui/shared/Disclaimer/useDisclaimer'

export const MyFeatureScreen = () => {
  const { accepted, isLoading, showDisclaimer } = useDisclaimer({
    type: 'swap',
    onCancel: () => navigation.goBack(),
  })

  const handleActionRequiringDisclaimer = () => {
    if (!accepted) {
      showDisclaimer()
      return
    }
    // Proceed with action
    performAction()
  }

  return (
    <View>
      <Button onPress={handleActionRequiringDisclaimer} />
    </View>
  )
}
```

### 3. Conditional Showing

Disable automatic showing based on conditions:

```tsx
<ShowDisclaimer
  type="dapps"
  disabled={!welcomeModalShown}
/>
```

## Available Disclaimer Types

- `'swap'` - For swap/exchange features
- `'exchange'` - For fiat exchange features
- `'dapps'` - For dApp connector features
- `'bring'` - For wallet restoration features

## How It Works

1. Each disclaimer type has a unique storage key
2. Once a user accepts a disclaimer, it's persisted in storage
3. The disclaimer won't show again for that type unless the user clears app data
4. Disclaimer text is loaded based on the user's language preference
5. Users must check the acceptance checkbox before they can proceed

