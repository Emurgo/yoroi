# @yoroi/identicon

## Identicon Module for Yoroi

### Overview

The Identicon module for Yoroi to provide a visual representation of a wallet (pub-key) using identicons. Initially, this module leverages Blockies and Jazzicon algorithms to generate these visual identifiers.

### Features

- **Blockies Support**: Generate identicons using the Blockies.
- **Headless Implementation**: Provides a base64 representation of SVGs, enabling easy use across different platforms.
- **Jazzicons Support**: Generate identicons using Jazzicon.

### Installation

To install the Identicon module, use npm/yarn:

```bash
# npm
npm install @yoroi/identicon

# yarn
yarn add @yoroi/identicon

# workspace
yarn workspace <pkg> add @yoroi/identicon
```

### Generating a Blockies identicon

```typescript
const publicKey = 'BEDEAD'
const blockie = new Blockies({seed: publicKey})
const base64Image = blockie.asBase64({size: 44})

// Use the base64Image string as needed, for example, setting it as the src of an img element
document.getElementById('identicon-image').src = base64Image
```

### Generating a Jazzicon identicon

```typescript
const publicKey = 'BEDEAD'
const jazz = new Jazzicon({seed: publicKey})
const base64Image = jazz.asBase64({size: 44})

// Use the base64Image string as needed, for example, setting it as the src of an img element
document.getElementById('identicon-image').src = base64Image
```

### Blockies API

`asBase64({ seed, size, scale })`
Generates a base64 encoded SVG image for the provided seed, the `width` and `height` are the result of `size * scale`

Parameters:

- `seed (string)`: The seed for which to generate the identicon.
- `size (number, optional)`: The size of the identicon grid. Default is 8.
- `scale (number, optional)`: The scale factor for the identicon. Default is 4.

Returns:
A `base64` encoded string representing the SVG image.

### Jazzicon API

`asBase64({ size })`
Generates a base64 encoded SVG image for the provided seed, the `width` and `height` are equals to `size`

Parameters:

- `size (number, optional)`: The size of the identicon grid. Default is 100.

Returns:
A `base64` encoded string representing the SVG image.
