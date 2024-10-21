# @yoroi/explorers

## Overview

The `@yoroi/explorers` is a TypeScript package designed to manage and interact with various blockchain explorers supported by the Yoroi Wallet. The package provides a consistent interface for generating URLs for different blockchain networks and explorers.

## Installation

To install the package, you can use npm or yarn:

```bash
npm install @yoroi/explorers
```

or

```bash
yarn add @yoroi/explorers
```

## Usage

To use `@yoroi/explorers`, you can import the necessary types and functions to generate URLs for tokens, addresses, transactions, pools, and stake keys.

Example

```typescript
import {Chain, Explorers} from '@yoroi/types'
import {explorerManager} from '@yoroi/explorers'

// Build the manager
const mainnetExplorer = explorerManager[Chain.Network.Mainnet]

// Generate URLs using CardanoScan explorer
const tokenUrl =
  mainnetExplorer[Explorers.Explorer.CardanoScan].token('fingerprint')
const addressUrl =
  mainnetExplorer[Explorers.Explorer.CardanoScan].address('address')
const txUrl = mainnetExplorer[Explorers.Explorer.CardanoScan].tx('txHash')
const poolUrl = mainnetExplorer[Explorers.Explorer.CardanoScan].pool('poolId')
const stakeUrl =
  mainnetExplorer[Explorers.Explorer.CardanoScan].stake('stakeAddress')

console.log(tokenUrl) // Output: https://cardanoscan.io/token/fingerprint
console.log(addressUrl) // Output: https://cardanoscan.io/address/address
console.log(txUrl) // Output: https://cardanoscan.io/transaction/txHash
console.log(poolUrl) // Output: https://cardanoscan.io/pool/poolId
console.log(stakeUrl) // Output: https://cardanoscan.io/stakeKey/stakeAddress
```

This example shows how to use the explorerManager object to generate URLs for different entities on the Mainnet using the CardanoScan explorer.

## About Supported Networks and Explorers

The following networks and explorers are supported:

Networks:

1. Mainnet: The live network for Cardano.
2. Preprod: The pre-production network for testing.
3. Preview: A preview network for new features.

Explorers:

1. CardanoScan: A popular Cardano blockchain explorer.

   1. [Twitter ![X](https://img.icons8.com/ios-filled/12/000000/x.png)](https://twitter.com/cardanoscan.io)
   2. [Discord ![Discord](https://img.icons8.com/ios-filled/12/000000/discord-logo.png)](https://discord.gg/WQFPHNXcz8)
   3. [Explorer](https://cardanoscan.io)

2. CExplorer: Another Cardano blockchain explorer.
   1. [Explorer](https://cexplorer.io)

## URL Generation

For each network and explorer, the following URL generation methods are available:

`token(fingerprint: string)`

`address(address: string)`

`tx(txHash: string)`

`pool(poolId: string)`

`stake(stakeAddress: string)`

## Adding a New Explorer

If you are a developer working on a new Cardano explorer and want to add support for it in Yoroi, you can do so by following these steps:

1. Fork the Repository
   Start by forking the `@yoroi/explorers` repository on GitHub.

2. Add Your Explorer URLs
   In the codebase, navigate to the `explorer-manager.ts` file. Add your explorer under the appropriate network with the URL generation methods (token, address, tx, pool, stake, etc).

   For example:

   ```typescript
   [Chain.Network.Mainnet]: {
      [Explorers.Explorer.YourExplorerName]: {
        token: (fingerprint: string) => `https://yourexplorer.io/token/${fingerprint}`,
        address: (address: string) => `https://yourexplorer.io/address/${address}`,
        tx: (txHash: string) => `https://yourexplorer.io/transaction/${txHash}`,
        pool: (poolId: string) => `https://yourexplorer.io/pool/${poolId}`,
        stake: (stakeAddress: string) => `https://yourexplorer.io/stake/${stakeAddress}`,
     },
   },
   ```

3. Test Your Implementation
   Write unit tests to ensure that the URLs generated for your explorer are correct. You can follow the existing test patterns in the explorerManager test suite, 100% coverage is expected.

   Running Tests

   ```bash
   yarn test
   ```

   This will run the unit tests to ensure that everything is working as expected.

4. Submit a Pull Request (PR)
   Once you've implemented and tested your explorer integration, submit a PR to the repository. The Yoroi development team will review your submission.

## Contributing

We welcome contributions from the community! If you find a bug or have a feature request, please open an issue or submit a pull request.
