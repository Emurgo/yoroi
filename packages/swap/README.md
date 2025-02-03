# @yoroi/swap

## Overview

The `@yoroi/swap` package enhances the Yoroi wallet by enabling integrated cryptocurrency swapping capabilities, thereby enriching the user experience and expanding the wallet's functionality.

## Glossary

In the context of the `@yoroi/swap` package, it's crucial to establish clear definitions for terms like **DEX**, **Protocol**, **Aggregator**, and **Liquidity Pool** to ensure consistent understanding among developers and users. These terms are often used interchangeably across various platforms, leading to confusion. A well-defined glossary helps maintain clarity and consistency in documentation and communication.

- **DEX (Decentralized Exchange)**: A decentralized platform that enables users to trade cryptocurrencies directly with each other without the need for a central authority. DEXs operate through smart contracts on blockchain networks, allowing for peer-to-peer transactions and increased security.
- **Protocol**: In decentralized finance (DeFi), a protocol refers to a set of rules and standards that define how transactions and interactions occur within a blockchain network. Protocols govern the behavior of DEXs, ensuring consistency, security, and interoperability among various DeFi applications.
- **Aggregator**: A service that consolidates liquidity from multiple DEXs and market makers to provide users with the best possible pricing for their trades. Aggregators analyze various platforms to find optimal trading routes, often splitting orders across multiple DEXs to minimize slippage and achieve favorable rates.
- **Liquidity Pool**: A collection of cryptocurrency tokens or assets locked in a smart contract. These pools are the foundation for decentralized trading, lending, and other financial services, eliminating the need for traditional intermediaries. In DeFi, liquidity pools enable 24/7 trading, automated price discovery, and opportunities for passive income through liquidity provision.

**Examples:**

- **Aggregators:**

  - [DexHunter](https://dexhunter.io/)
  - [MuesliSwap](https://muesliswap.com/)

- **DEXes:**

  - [MuesliSwap](https://muesliswap.com/)
  - [Minswap](https://minswap.org/)
  - [WingRiders](https://wingriders.com/)
  - [Spectrum](https://spectrum.fi)
  - [Sundaeswap](https://sundae.fi)
  - [Teddy](http://app.teddyswap.org)
  - [Vyfi](https://app.vyfi.io)

- **Protocols:**:
  - `WingRiders_v1`
  - `WingRiders_v2`
  - `Muesliswap_v1`

By standardizing these definitions, we can reduce misunderstandings and ensure that all stakeholders have a unified understanding of these critical components within the `@yoroi/swap` package. Consistent terminology enhances communication, facilitates collaboration, and improves the overall quality of the software documentation.

### Multi-Role Organizations

It's also important to highlight that some organizations can play more than one role at the same time.

For example, **MuesliSwap** is not only a **DEX**, but it also has its own **protocols** (such as its **order book model** and **AMM model**) and operates as an **aggregator**, routing trades across different liquidity sources for better pricing.

Understanding these overlapping roles helps in distinguishing **where liquidity is sourced from**, **who is facilitating trades**, and **which protocols define the execution rules**.
