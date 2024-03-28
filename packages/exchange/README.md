# Yoroi Exchange Module

The Yoroi Exchange package is a utility for interacting with exchanges the folowwing resources/APIs:

-  [Banxa](https://banxa.com/)

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