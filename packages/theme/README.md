# @yoroi/theme

[![npm version](https://img.shields.io/npm/v/@yoroi/theme.svg)](https://www.npmjs.com/package/@yoroi/theme)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=theme)](https://codecov.io/gh/Emurgo/yoroi)

The Theme package of Yoroi SDK - A collection of theme utilities and styling components used across the Yoroi ecosystem.

## 📦 Installation

```bash
npm install @yoroi/theme
# or
yarn add @yoroi/theme
```

## 🔧 Requirements

- Node.js >= 22.12.0
- React >= 16.8.0 < 20.0.0
- React Native >= 0.79.0

## 🚀 Usage

The theme package uses "t-shirt" sizes e.g `sm`, `md`, `lg`, etc.

Naming conventions follow Tailwind, delimited by `_` instead of `-` to
enable object access.

### Atoms

The style definitions that "match" Tailwind CSS selectors.

```tsx
import {atoms as a} from '@yoroi/theme'

;<View style={[a.flex_1]} />
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

## 📚 Documentation

For detailed documentation, please visit our [documentation site](https://github.com/Emurgo/yoroi/wiki).

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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=theme)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/theme)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
