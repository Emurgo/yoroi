# Yoroi Exchange Module

The Yoroi Exchange package is a utility for interacting with exchanges resources/APIs.

## Installation

Install the package using npm or yarn :

```bash
npm install @yoroi/exchange --save
```
```bash
yarn add @yoroi/exchange --save
```

## Usage

### Generating a Banxa referral URL to redirect/open
```typescript
import { Banxa, banxaModuleMaker } from '@yoroi/exchange';

const options: Banxa.ReferralUrlBuilderOptions = {
    isProduction: true,
    partner: 'emurgo',
};

const params: Banxa.ReferralUrlQueryStringParams = {
    fiatType: 'USD',
    coinType: 'ADA',
    walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
};

const banxa = banxaModuleMaker(options);

const url = banxa.createReferralUrl(params);

console.log(url.toString())
```

### Return URL

The return url must have the following prefix:

`yoroi://<url>/<params>`

### Error handling
```typescript
try {
    // some Banxa code
} catch (error) {
    if (error instanceof Banxa.ValidationError) {
        console.error("Validation error:", error.message);
    } else if (error instanceof Banxa.UnknownError) {
        console.error("Unknown error:", error.message);
    }
}
```

### Running on mobile
To use this module on a `react-native` application it is required to polyfill the URL object by using modules such as `react-native-url-polyfill`