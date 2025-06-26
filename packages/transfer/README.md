# @yoroi/transfer

[![npm version](https://img.shields.io/npm/v/@yoroi/transfer.svg)](https://www.npmjs.com/package/@yoroi/transfer)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=transfer)](https://codecov.io/gh/Emurgo/yoroi)

This package for now is a form editor for the transfer (send function), next step is to update in a way it can continue a transaction to compound it.

## Installation

You can install the package through:

```bash
// npm
npm install @yoroi/transfer

// yarn
yarn add @yoroi/transfer

// workspace
yarn workspace <your-package> add @yoroi/transfer
```

## Usage

The `@yoroi/transfer` package provides a React context and hooks for managing transfer state in Cardano wallet applications. Here's a simple example of how to use it:

### Basic Setup

First, wrap your application (or the component tree that needs transfer functionality) with the `TransferProvider`:

```tsx
import React from 'react'
import { TransferProvider } from '@yoroi/transfer'

function App() {
  return (
    <TransferProvider>
      <TransferForm />
    </TransferProvider>
  )
}
```

### Using the Transfer Hook

Create a component that uses the transfer functionality:

```tsx
import React from 'react'
import { useTransfer } from '@yoroi/transfer'

function TransferForm() {
  const {
    // State
    targets,
    selectedTargetIndex,
    selectedTokenId,
    allocated,
    memo,
    
    // Actions
    receiverResolveChanged,
    amountChanged,
    tokenSelectedChanged,
    memoChanged,
    reset,
  } = useTransfer()

  const currentTarget = targets[selectedTargetIndex]

  const handleAddressChange = (address: string) => {
    receiverResolveChanged(address)
  }

  const handleAmountChange = (amount: string) => {
    amountChanged({
      tokenId: selectedTokenId,
      quantity: amount,
    })
  }

  const handleTokenSelect = (tokenId: string) => {
    tokenSelectedChanged(tokenId)
  }

  const handleMemoChange = (memo: string) => {
    memoChanged(memo)
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div>
      <h2>Send Transaction</h2>
      
      {/* Address Input */}
      <div>
        <label>Recipient Address:</label>
        <input
          type="text"
          value={currentTarget.receiver.resolve}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="Enter Cardano address or domain"
        />
      </div>

      {/* Token Selection */}
      <div>
        <label>Token:</label>
        <select
          value={selectedTokenId}
          onChange={(e) => handleTokenSelect(e.target.value)}
        >
          <option value=".">ADA</option>
          <option value="token123">Custom Token</option>
        </select>
      </div>

      {/* Amount Input */}
      <div>
        <label>Amount:</label>
        <input
          type="number"
          value={currentTarget.entry.amounts[selectedTokenId]?.quantity || ''}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      {/* Memo Input */}
      <div>
        <label>Memo (optional):</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => handleMemoChange(e.target.value)}
          placeholder="Transaction memo"
        />
      </div>

      {/* Allocated Amounts Display */}
      <div>
        <h3>Allocated Amounts:</h3>
        {Array.from(allocated.entries()).map(([tokenId, amount]) => (
          <div key={tokenId}>
            {tokenId}: {amount.quantity}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div>
        <button onClick={handleReset}>Reset Form</button>
        <button onClick={() => console.log('Send transaction')}>
          Send Transaction
        </button>
      </div>
    </div>
  )
}
```

### Advanced Usage with Initial State

You can also provide initial state when setting up the provider:

```tsx
import React from 'react'
import { TransferProvider } from '@yoroi/transfer'

function App() {
  const initialState = {
    selectedTokenId: 'customToken123',
    memo: 'Initial memo',
    targets: [
      {
        receiver: {
          resolve: 'addr1qxck...',
          as: 'address',
          selectedNameServer: undefined,
          addressRecords: undefined,
        },
        entry: {
          address: 'addr1qxck...',
          amounts: {
            'customToken123': {
              tokenId: 'customToken123',
              quantity: '100',
            },
          },
        },
      },
    ],
  }

  return (
    <TransferProvider initialState={initialState}>
      <TransferForm />
    </TransferProvider>
  )
}
```

### Key Features

- **Multi-target support**: Handle multiple recipients in a single transaction
- **Token management**: Select and manage different Cardano tokens
- **Address resolution**: Support for both direct addresses and domain names
- **Amount allocation**: Track allocated amounts across multiple targets
- **Memo support**: Add optional transaction memos
- **State persistence**: Maintain transfer state across component re-renders
- **Reset functionality**: Clear all transfer data when needed

The package provides a complete state management solution for building transfer/send functionality in Cardano wallet applications.

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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=transfer)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/transfer)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
