# @yoroi/staking

[![npm version](https://img.shields.io/npm/v/@yoroi/staking.svg)](https://www.npmjs.com/package/@yoroi/staking)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=staking)](https://codecov.io/gh/Emurgo/yoroi)

This package contains staking-related functionality for Yoroi. It may include Catalyst voting, delegation, governance, etc.

## Installation

You can install the package through:

```bash
// npm
npm install @yoroi/staking

// yarn
yarn add @yoroi/staking

// workspace
yarn workspace <your-package> add @yoroi/staking
```

## Usage

The `@yoroi/staking` package provides functionality for Catalyst voting and Cardano governance operations. Here are examples of how to use the main features:

### Catalyst Voting

The Catalyst module provides functionality to interact with Catalyst Fund voting:

```typescript
import { catalystManagerMaker } from '@yoroi/staking'
import { catalystApiMaker } from '@yoroi/staking'

// Create API instance
const catalystApi = catalystApiMaker({
  baseURL: 'https://catalyst-api.example.com',
  timeout: 10000,
})

// Create manager instance
const catalystManager = catalystManagerMaker({ api: catalystApi })

// Get current fund information
const fundInfo = await catalystManager.getFundInfo()
console.log('Fund Name:', fundInfo.data.fundName)
console.log('Voting Period:', fundInfo.data.votingStart, 'to', fundInfo.data.votingEnd)

// Check fund status
const status = catalystManager.fundStatus(fundInfo.data)
console.log('Registration:', status.registration) // 'pending' | 'running' | 'done'
console.log('Voting:', status.voting) // 'pending' | 'running' | 'done'
console.log('Results:', status.results) // 'pending' | 'running' | 'done'

// Access configuration
console.log('Fund API URL:', catalystManager.config.api.fund)
console.log('Mobile Apps:', catalystManager.config.apps)
```

### Governance Operations

The governance module provides functionality for DRep delegation and voting:

```typescript
import { 
  governanceManagerMaker, 
  GovernanceProvider,
  useGovernance,
  useVotingCertificate,
  useDelegationCertificate,
  useStakingKeyState 
} from '@yoroi/staking'

// Create governance manager
const governanceManager = governanceManagerMaker({
  network: 'mainnet',
  walletId: 'your-wallet-id',
  cardano: cardanoWasmInstance,
  storage: storageInstance,
  api: governanceApiInstance,
})

// Validate a DRep ID
try {
  await governanceManager.validateDRepID('drep1abc123...')
  console.log('DRep ID is valid')
} catch (error) {
  console.error('Invalid DRep ID:', error.message)
}

// Create delegation certificate
const delegationCert = await governanceManager.createDelegationCertificate(
  'drep-hash-hex',
  'key', // or 'script'
  stakingPublicKey
)

// Create voting certificate
const votingCert = await governanceManager.createVotingCertificate(
  'abstain', // or 'no-confidence'
  stakingPublicKey
)

// Get staking key state
const stakingState = await governanceManager.getStakingKeyState('stake-key-hash')
if (stakingState.drepDelegation) {
  console.log('Current delegation:', stakingState.drepDelegation)
}
```

### React Hooks

The package provides React hooks for easy integration:

```typescript
import React from 'react'
import { 
  GovernanceProvider,
  useGovernance,
  useVotingCertificate,
  useDelegationCertificate,
  useStakingKeyState 
} from '@yoroi/staking'

function GovernanceApp() {
  return (
    <GovernanceProvider governanceManager={governanceManager}>
      <GovernanceComponent />
    </GovernanceProvider>
  )
}

function GovernanceComponent() {
  const governance = useGovernance()
  const { createVotingCertificate } = useVotingCertificate()
  const { createDelegationCertificate } = useDelegationCertificate()
  const { getStakingKeyState } = useStakingKeyState()

  const handleVote = async () => {
    try {
      const certificate = await createVotingCertificate('abstain', stakingKey)
      // Submit transaction with certificate
      console.log('Voting certificate created:', certificate)
    } catch (error) {
      console.error('Failed to create voting certificate:', error)
    }
  }

  const handleDelegation = async () => {
    try {
      const certificate = await createDelegationCertificate(
        'drep-hash',
        'key',
        stakingKey
      )
      // Submit transaction with certificate
      console.log('Delegation certificate created:', certificate)
    } catch (error) {
      console.error('Failed to create delegation certificate:', error)
    }
  }

  return (
    <div>
      <button onClick={handleVote}>Vote Abstain</button>
      <button onClick={handleDelegation}>Delegate to DRep</button>
    </div>
  )
}
```

### Utility Functions

The package also provides utility functions for working with DRep IDs:

```typescript
import { 
  parseDrepId,
  convertHexKeyHashToBech32Format,
  convertDrepHashToCIP129Format,
  convertDrepHashToCIP105Format 
} from '@yoroi/staking'

// Parse a DRep ID
const parsed = await parseDrepId('drep1abc123...', cardanoWasm)
console.log('DRep hash:', parsed.hash)
console.log('DRep type:', parsed.type)

// Convert hex key hash to Bech32 format
const bech32Hash = await convertHexKeyHashToBech32Format(
  'hex-key-hash',
  cardanoWasm
)

// Convert DRep hash to different formats
const cip129Format = convertDrepHashToCIP129Format('drep-hash')
const cip105Format = convertDrepHashToCIP105Format('drep-hash')
```

### Types

The package exports comprehensive TypeScript types:

```typescript
import type {
  Catalyst,
  CardanoTypes,
  GovernanceManager,
  StakingKeyState,
  VoteKind,
  GovernanceAction
} from '@yoroi/staking'

// Catalyst types
const fundInfo: Catalyst.FundInfo = {
  id: 1,
  fundName: 'Fund 10',
  fundStartTime: new Date(),
  fundEndTime: new Date(),
  // ... other properties
}

// Governance types
const voteKind: VoteKind = 'abstain' // or 'no-confidence'
const governanceAction: GovernanceAction = {
  kind: 'delegate-to-drep',
  hash: 'drep-hash',
  type: 'key',
  txID: 'transaction-id'
}
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

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=staking)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/staking)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)
