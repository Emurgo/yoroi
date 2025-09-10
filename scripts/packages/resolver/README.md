# `@yoroi/resolver`

[![npm version](https://img.shields.io/npm/v/@yoroi/resolver.svg)](https://www.npmjs.com/package/@yoroi/resolver)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=resolver)](https://codecov.io/gh/Emurgo/yoroi)

A module for resolving Cardano addresses from domains or handles.

Currently, the following services are supported:

- [CNS](https://cns.space)
- [handle](https://handle.me)
- [Unstoppable Domains](https://unstoppabledomains.com)

## Instalation

`yarn install @yoroi/resolver`

or

`npm install @yoroi/resolver`

## Usage

There are two strategies supported to get a crypto address:

- **all**: Will attempt to resolve for all services.
- **first**: Will return the service that resolves first.

## API Reference

- **`resolverApiMaker`**

Accepted arguments:

1. apiConfig: `{unstoppable: '<unstoppable api key>'}`
2. cslFactory: Cardano Serialization Library initiator

Returns: `getCardanoAddresses`

- **`getCardanoAddresses`**

Accepted arguments:

1. resolve: `string`. Domain or handle to look for.
2. strategy: `all` | `first`

Returns depending on the strategy selected:

All:

```typescript
[
  {nameServer: 'cns', address: string | null, error: Error instance | null},
  {nameServer: 'unstoppable', address: string | null, error: Error instance | null},
  {nameServer: 'handle', address: string | null, error: Error instance | null}
]
```

First:

```typescript
[
  {nameServer: 'cns' | 'unstoppable' | 'handle', address: string | null, error: Error instance | null}
]
```

## Contributing

We welcome contributions from the community! If you find a bug or have a feature request, please open an issue or submit a pull request.

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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=resolver)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/resolver)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
