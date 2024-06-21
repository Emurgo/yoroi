# @yoroi/identicon

## Identicon Module for Yoroi

### Overview

The Identicon module for Yoroi to provide a visual representation of a wallet (pkey) using identicons. Initially, this module leverages Blockies to generate these visual identifiers. In future updates, support for Jazzicons will be included, offering more variety in visual representation.

### Features

- **Blockies Support**: Generate identicons using the Blockies.
- **Headless Implementation**: Provides a base64 representation of SVGs, enabling easy use across different platforms.
- **Future Jazzicons Support**: Upcoming support for generating identicons using Jazzicons.

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
const publicKey = 'your-public-key-here-hex'
const blockie = new Blockies()
const base64Image = blockie.asBase64({seed: publicKey})

// Use the base64Image string as needed, for example, setting it as the src of an img element
document.getElementById('identicon-image').src = base64Image
```

### API

#### Methods

`asBase64({ seed, size, scale })`
Generates a base64 encoded SVG image for the provided seed, the `width` and `height` are the result of `size * scale`

Parameters:

- `seed (string)`: The seed for which to generate the identicon.
- `size (number, optional)`: The size of the identicon grid. Default is 8.
- `scale (number, optional)`: The scale factor for the identicon. Default is 4.

Returns:
A `base64` encoded string representing the SVG image.
