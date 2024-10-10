# Yoroi Theme

## Usage

It uses "t-shirt" sizes e.g `sm`, `md`, `lg`, etc.

Naming conventions follow Tailwind, delimited by `_` instead of `-` to
enable object access.

### Atoms

The style definitions that "match" Tailwind CSS selectors.

```tsx
import {atoms as a} from '@yoroi/theme'

<View style={[a.flex_1]} />
```

### Theme

The palette definition, prefer to use `useThemeColor` most of the time.
The `useTheme` was designed to manage the theme and not to consume it.
Sub vars should be consumed from the theme always, everything else should be consumed from atoms directly.

```tsx
import {atoms as a, useThemeColor} from '@yoroi/theme'

const {gray_500} = useThemeColor()

<View style={[a.flex_1, {backgroundColor: gray_500}]} />
```
