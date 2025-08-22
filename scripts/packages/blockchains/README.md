# @yoroi/blockchains

[![npm version](https://img.shields.io/npm/v/@yoroi/blockchains.svg)](https://www.npmjs.com/package/@yoroi/blockchains)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=blockchains)](https://codecov.io/gh/Emurgo/yoroi)

A dedicated package for blockchain logic for Yoroi clients.

## 📦 Installation

```bash
npm install @yoroi/blockchains
# or
yarn add @yoroi/blockchains
```

## 🔧 Requirements

- Node.js >= 22.12.0
- React >= 16.8.0 < 20.0.0
- React Native >= 0.79.0

## 🚀 Usage

The `@yoroi/blockchains` package centralizes all blockchain-specific functionalities previously scattered throughout the Yoroi codebase, (work in progress).

### Network Management

```tsx
import {buildNetworkManagers} from '@yoroi/blockchains'
import {CardanoApi} from '@yoroi/api'
import {logger} from '@yoroi/common'

// Build network managers for all supported networks
const networkManagers = buildNetworkManagers({
  tokenManagers: {
    // Your token managers for each network
    mainnet: mainnetTokenManager,
    preprod: preprodTokenManager,
    preview: previewTokenManager,
    sancho: sanchoTokenManager,
  },
  logger,
  apiMaker: CardanoApi.cardanoApiMaker, // Optional, uses default if not provided
})

// Access specific network manager
const mainnetManager = networkManagers.mainnet
const preprodManager = networkManagers.preprod
```

### Address Derivation Configuration

```tsx
import {derivationConfig} from '@yoroi/blockchains'

// Access derivation path configuration
console.log(derivationConfig.gapLimit) // 20
console.log(derivationConfig.keyLevel.root) // 0
console.log(derivationConfig.keyLevel.purpose) // 1
console.log(derivationConfig.keyLevel.coinType) // 2
```

### Cardano Constants and Configuration

```tsx
import {
  primaryTokenInfoMainnet,
  primaryTokenInfoAnyTestnet,
  shelleyEraConfig,
  byronEraConfig,
  protocolParamsPlaceholder,
} from '@yoroi/blockchains'

// Access primary token information
console.log(primaryTokenInfoMainnet.ticker) // 'ADA'
console.log(primaryTokenInfoMainnet.symbol) // '₳'
console.log(primaryTokenInfoAnyTestnet.ticker) // 'TADA'

// Access era configurations
console.log(shelleyEraConfig.name) // 'shelley'
console.log(shelleyEraConfig.slotsPerEpoch) // 432000
console.log(byronEraConfig.slotInSeconds) // 20

// Access protocol parameters placeholder
console.log(protocolParamsPlaceholder.epoch) // 67
console.log(protocolParamsPlaceholder.poolDeposit) // '500000000'
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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=blockchains)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/blockchains)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
