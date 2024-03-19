# @yoroi/links

## Overview
This package provides type-safe way to create and parse cryptocurrency-related links based on its URI definition (ABNF). It is designed to support different types of operations. It supports Cardano operations such as claims and legacy transfers within its blockchain ecosystem. It also allows to interpret and build crypto links.

## Features
- **Custom URI Scheme Handling**: Supports the 'web+cardano' URI scheme, tailored for Cardano blockchain interactions.
- **Type-Safe Link Creation and Parsing**: Utilizes TypeScript for ensuring the integrity and correctness of link structures.
- **Configurable for Different Operations/Chains**: Includes configurations for claim operations (`configCardanoClaimV1`) and legacy transfers (`configCardanoLegacyTransfer`), it can be extended.
- **Yoroi Deep Links**: Supports the 'yoroi' URI scheme, tailored for interation with Yoroi.

## Installation
How to install the package, e.g., via npm or yarn:
```bash
npm install @yoroi/links
# or
yarn add @yoroi/links
```

## Cardano Usage
### Importing the Module
```typescript
import { linksCardanoModuleMaker, configCardanoClaimV1 } from '@yoroi/links';
```

### How to create a link
```typescript
const { create } = linksCardanoModuleMaker();

const cardanoLink = create({
  config: configCardanoClaimV1,
  params: {
    faucet_url: "https://someendpoint/airdrop",
    code: "CardanoSummit2024",
    other: "other param"
  }
});

console.log(cardanoLink.link); 
```

### How to parse a link
```typescript
const { parse } = linksCardanoModuleMaker();

const parsedLink = parse('web+cardano://claim/v1?code=123&faucet_url=http://example.com');
console.log(parsedLink);
```

### API reference

#### Interface 
- `create`: Creates a crypto link based on the provided configuration and parameters.
- `parse`: Parses a given string into a Link object if supported, otherwise will throw.

#### Built-in configurations
- `configCardanoClaimV1`: Configuration for Cardano `claim` operations. [CIP99](https://github.com/cardano-foundation/CIPs/pull/546/files)
- `configCardanoLegacyTransfer`: Configuration for Cardano `legacy` transfers. [CIP13](https://cips.cardano.org/cips/cip13/)

#### Supported Schemes and Authorities

| Scheme         | Authority | Description                                 |
|----------------|-----------|---------------------------------------------|
| `web+cardano`  | `claim`   | Used for proof of onboarding / airdrops     |
| `web+cardano`  | ` `       | Used for legacy payment requests            |


## Yoroi Usage
### Importing the Module
```typescript
import { linksYoroiModuleMaker, linksCardanoModuleMaker, configCardanoLegacyTransfer } from '@yoroi/links';
```

### How to create a link
```typescript
const { create } = linksCardanoModuleMaker();
const { transfer } = linksYoroiModuleMaker('yoroi');

const cardanoLink = create({
  config: configCardanoLegacyTransfer,
  params: {
    amount: 1,
    address: "$stackchain"
  }
});

const yoroiPaymentRequestWithAdaLink = transfer.request.adaWithLink(cardanoLink.link)

console.log(yoroiPaymentRequestWithAdaLink); 
```

### Supported Schemes and Authorities

| Scheme          | Authority  | Description                                 |
|-----------------|------------|---------------------------------------------|
| `yoroi` `https` | `transfer` | Used for requesting payments                |
| `yoroi` `https` | `exchange` | Used for iteracting with exchanges          |
| `yoroi` `https` | `dapp`     | **soon**                                    |


## For more
- [BIP-21](https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki) 
- [EIP-681](https://eips.ethereum.org/EIPS/eip-681)
- [URI](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiGtpWV-eOCAxVSmokEHdBOAn0QFnoECBQQAQ&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FUniform_Resource_Identifier&usg=AOvVaw2i8uSyn7gtMV9bW4Nmh4dK&opi=89978449)
- [ABNF](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjYq-3u-OOCAxVxvokEHTx1CqsQFnoECBIQAQ&url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FAugmented_Backus%25E2%2580%2593Naur_form&usg=AOvVaw3GEFuH6Hby-NUw6cxQpQUz&opi=89978449)
- [RFC-2234](https://datatracker.ietf.org/doc/html/rfc2234)
