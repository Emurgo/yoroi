# @yoroi/exchange

[![npm version](https://img.shields.io/npm/v/@yoroi/exchange.svg)](https://www.npmjs.com/package/@yoroi/exchange)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=exchange)](https://codecov.io/gh/Emurgo/yoroi)

The Yoroi Exchange package is a utility for interacting with exchanges the folowwing resources/APIs:

- [Banxa](https://banxa.com/)
- [Encryptus](https://encryptus.io)

## Installation

Install the package using npm or yarn :

```bash
npm install @yoroi/exchange --save
npm install @yoroi/types --save-dev
```

```bash
yarn add @yoroi/exchange --save
yarn add @yoroi/types --save-dev
```

## Usage

### Generating a Banxa referral URL to redirect/open

```typescript
import { exchangeManagerMaker } from '@yoroi/exchange';
import { Exchange } from '@yoroi/types';

const options: Exchange.ManagerOptions = {
    isProduction: true,
    partner: 'emurgo',
};

const params: Exchange.ReferralUrlQueryStringParams = {
    fiatType: 'USD',
    coinType: 'ADA',
    walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
};

const module = exchangeManagerMaker(Exchange.Provider.Banxa, options);

const url = module.createReferralUrl(params);

console.log(url.toString())
```

### Error handling

```typescript
try {
    // some Banxa code
} catch (error) {
    if (error instanceof Exchange.Error.Validation) {
        console.error("Validation error:", error.message);
    } else if (error instanceof Exchange.Error.Unknown) {
        console.error("Unknown error:", error.message);
    }
}
```

### Running on mobile

To use this module on a `react-native` application it is required to polyfill the URL object by using modules such as `react-native-url-polyfill`

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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=exchange)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/exchange)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
