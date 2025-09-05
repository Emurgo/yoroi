# @yoroi/identicon

[![npm version](https://img.shields.io/npm/v/@yoroi/identicon.svg)](https://www.npmjs.com/package/@yoroi/identicon)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=identicon)](https://codecov.io/gh/Emurgo/yoroi)

## 📦 Installation

```bash
# npm
npm install @yoroi/identicon

# yarn
yarn add @yoroi/identicon

# workspace
yarn workspace <pkg> add @yoroi/identicon
```

## 🔧 Requirements

- Node.js >= 22.12.0
- React >= 16.8.0 < 20.0.0
- React Native >= 0.79.0

## 🚀 Usage

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

## 📚 API Reference

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

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Build for development
npm run build:dev

# Build for release
npm run build:release
```

## 📊 Code Coverage

The package maintains a minimum code coverage threshold of 20% with a 1% threshold for status checks.

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=identicon)](https://codecov.io/gh/Emurgo/yoroi)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/identicon)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
