# @yoroi/common

[![npm version](https://img.shields.io/npm/v/@yoroi/common.svg)](https://www.npmjs.com/package/@yoroi/common)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=common)](https://codecov.io/gh/Emurgo/yoroi)

The Common package of Yoroi SDK - A collection of shared utilities and components used across the Yoroi ecosystem.

## 📦 Installation

```bash
npm install @yoroi/common
# or
yarn add @yoroi/common
```

## 🔧 Requirements

- Node.js >= 22.12.0
- React >= 16.8.0 < 20.0.0
- React Native >= 0.79.0

## 🚀 Usage

```typescript
import { truncateString, atomicFormatter } from '@yoroi/common';

// Example 1: Truncate a long string
const longText = 'This is a very long string that needs to be truncated.';
const shortText = truncateString({ value: longText, maxLength: 20 });
console.log(shortText); // Output: 'This is a ...truncated.'

// Example 2: Format a bigint with decimals
const formatted = atomicFormatter({ value: 1234567890000000000n, decimalPlaces: 18 });
console.log(formatted); // Output: '1.234567890000000000'

// Example 3: Use a React hook to subscribe to an observable
import * as React from 'react';
import { BehaviorSubject } from 'rxjs';
import { useObservableValue } from '@yoroi/common';

const count$ = new BehaviorSubject(0);

function Counter() {
  const count = useObservableValue({
    observable$: count$,
    getter: () => count$.getValue(),
  });
  return <div>Count: {count}</div>;
}
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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=common)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/common)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
