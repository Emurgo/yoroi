# @yoroi/portfolio

The `@yoroi/portfolio` package is an all-in-one solution for managing token portfolios, images, prices, balances, and token information within the Yoroi wallet ecosystem. Designed with modern web and mobile applications in mind, this package not only handles token data but also offers integrated CDN support for images, ensuring smooth and efficient loading, especially on mobile devices. 

By leveraging CDN, it avoids the "lag" associated with directly using IPFS, specially in cases where the images are not pinned to any service.

Additionally, `@yoroi/portfolio` comes with built-in support for DeFi prices, allowing to fetch and manage the latest token prices with ease.

- [Installation](#installation)
- [Overview](#overview)
- [API Reference](#api-reference)
  - [PortfolioTokenManager](#portfolio-token-manager-maker)
  - [PortfolioBalanceManager](#portfolio-balance-manager-maker)
- [Features](#features)
- [Contributing](#contributing)

## Installation

You can install the package through:

```bash
// npm
npm install @yoroi/portfolio

// yarn
yarn add @yoroi/portfolio

// workspace
yarn workspace <your-package> add @yoroi/portfolio
```

## Overview

The `@yoroi/portfolio` package provides two primary factory functions, and one goal which is to facilitate dealing with tokens on web3.
Dealing with Cardano native assets presents unique challenges due to the platform's design and its UTxO model, which differs from the account-based models used by other blockchains like Ethereum. Unlike traditional blockchains where tokens are treated as simple balances, Cardano’s native assets (secondary tokens) are handled in the same way as ADA (primary token), the network’s native currency, and are tied to specific UTxOs.

This requires developers to manage multiple inputs and outputs meticulously, which complicates token transactions, especially when interacting with multiple tokens simultaneously. Additionally, the lack of standardized token behavior—since each token can have its own set of rules and characteristics—adds another layer of complexity. Managing token metadata, ensuring compatibility with wallets, and handling the intricacies of multi-asset transactions make working with Cardano tokens a demanding task, requiring a deep understanding of the platform’s architecture.

Therefore this package was broken into two main factory functions:

`portfolioTokenManagerMaker`: Manages token information, including caching and synchronization with external APIs, the token manager was design to aggregate information per network.
`portfolioBalanceManagerMaker`: Manages token balances, including primary and secondary tokens, and synchronizes these balances based on wallet information, its primary dependency is the UTxOs, most of the information is derived from it. It also takes that token manager as dependency to identify token info properties.

## API Reference

### Portfolio Token Manager Maker

Description

The `portfolioTokenManagerMaker` factory function creates a token manager that leverages the Yoroi CDN to get information about the tokens and also provide details about the traits and the discovery process of a token it handles the following:

- Hydration: Loads cached token information from storage.
- Synchronization: Synchronizes token information with external APIs, handling unknown tokens and invalidated caches.
- Clearing: Clears token information from storage and cache.
- Observation: Notifies observers about changes in the token information.

Dependencies

- `api`: An object that provides methods to fetch token information from an external API.
- `storage`: An object that provides methods to store and retrieve token information locally.
- `observer` (optional): An observer manager to handle events related to token information changes.

Returns

A frozen object containing methods to `hydrate`, `sync`hronize, `clear`, and `destroy` the token manager.

### Portfolio Balance Manager Maker

Description

The `portfolioBalanceManagerMaker` factory function creates a balance manager to manage token balances and prices it handles the following:

- Hydration: Loads token balances from storage, including primary and secondary tokens.
- Synchronization: Synchronizes token balances based on UTxOs updates (new transactions).
- Primary Balance Management: Manages the primary token's balance, including breakdown into different parts.
- Observation: Notifies observers about changes in token balances.

Dependencies

- `tokenManager`: An instance of `Portfolio.Manager.Token` created by `portfolioTokenManagerMaker`.
- `primaryTokenInfo`: Information about the primary token (e.g., ADA) in the portfolio.
- `storage`: An object that provides methods to store and retrieve balance information locally.
- `sourceId`: A unique identifier for the source of events.
- `observer` (optional): An observer manager to handle events related to balance changes.
- `queue` (optional): A task queue manager to handle asynchronous operations in sequence.

Returns

A frozen object containing methods to `hydrate`, `refresh`, `syncBalances`, `synchBalances`, `destroy`, `clear` and many more to manage the balances and prices of the primary token and secondary token.

## Features

- Caching: Efficiently cache token information and balances for quick access, it leverages the `cache-control` and `eTag` from the backend to avoid hitting the API constantly.
- Synchronization: Keep token information and balances up-to-date with external sources (`CIP68`, Token Registry the off-chain token record `CIP26`).
- Event Observation: Allows client to subscribe to handle events related to tokens and balances. (check the `Token.Event` for all options)
- Primary Token Management: Special handling for primary tokens, including detailed breakdowns of balances (rewards, locked deposit - cost to keep UTxOs).
- Customization: Extensible with custom observers and task queues (it manages concurrency automatically, therefore many wallets can synchronize at the same time, it ensures the persisted and cached state are atomic).
- Loose Checking: There are some loose checks to list tokens that were minted with wrong metadata (not following the specs, `CIP25`).
- DeFi: Support token activity and price history, for now the supported protocols are:
  - Cardano
    - [MinSwap v1 & v2](https://minswap.org)

If you are looking for more information about the APIs, events and types please check [here](https://github.com/Emurgo/yoroi/tree/develop/packages/types/src/portfolio)

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any changes or improvements.
