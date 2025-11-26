# Deep Link Testing Guide

This guide explains how to test all deep link types supported by Yoroi Mobile.

## Quick Start

Run the comprehensive test script:

```bash
# For development build (default)
./scripts/test-all-links-android.sh

# For production build
./scripts/test-all-links-android.sh com.emurgo
```

**Important Note for `web+cardano://` Links:**
The `web+cardano` scheme requires the intent filter to be properly registered in `AndroidManifest.xml`. If `web+cardano` links aren't working:

1. Ensure the intent filter is present in `android/app/src/main/AndroidManifest.xml`
2. Rebuild the app: `npm run android` or `npx expo prebuild --clean`
3. The intent filter should be automatically generated from `app.json`, but if it's missing, it needs to be added manually

## Link Types

### Yoroi Links (`yoroi://yoroi-wallet.com/w1/...`)

#### 1. Transfer Request ADA (Direct Params)

**Path:** `/w1/transfer/request/ada`

**Required Parameters:**

- `targets[0][receiver]`: Wallet address or domain name (max 256 chars)
- `targets[0][amounts][0][tokenId]`: Token ID (`.` for ADA, or `policyId.assetName` in hex)
- `targets[0][amounts][0][quantity]`: Amount in atomic units (Lovelaces for ADA)

**Optional Parameters:**

- `targets[0][datum]`: CBOR string (max 1024 chars)
- `memo`: Memo string (max 256 chars)
- `appId`: Partner app identifier (max 40 chars)
- `message`: User-facing message (max 256 chars)
- `walletId`: UUID of the wallet
- `authorization`: UUID authorization token
- `signature`: Partner signature
- `redirectTo`: HTTPS URL for redirect
- `isSandbox`: `true`/`false` (for dev builds)
- `isTestnet`: `true`/`false` (for testnet wallets)

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000&memo=Test+transfer"
```

#### 2. Transfer Request ADA with Link

**Path:** `/w1/transfer/request/ada-with-link`

**Required Parameters:**

- `link`: Cardano link URL (max 2048 chars, URL encoded)

**Optional Parameters:** Same as Transfer Request ADA

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/transfer/request/ada-with-link?link=web%252Bcardano%253Aaddr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2%253Famount%253D10"
```

#### 3. Exchange Order Show Create Result

**Path:** `/w1/exchange/order/show-create-result`

**Required Parameters:**

- `provider`: Exchange provider name (max 20 chars)
- `orderType`: `buy` or `sell`

**Optional Parameters:**

- `coinAmount`: Amount in coin denomination
- `coin`: Coin ticker (e.g., `ADA`)
- `fiatAmount`: Amount in fiat currency
- `fiat`: Fiat ticker (e.g., `USD`)
- `status`: `success`, `pending`, or `failed`
- `appId`, `message`, `walletId`, `authorization`, `signature`, `redirectTo`, `isSandbox`, `isTestnet`

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/exchange/order/show-create-result?provider=changelly&coinAmount=100&coin=ADA&fiatAmount=50&fiat=USD&status=success&orderType=buy"
```

#### 4. Browser Launch DApp URL

**Path:** `/w1/browser/launch`

**Required Parameters:**

- `dappUrl`: DApp URL (max 2048 chars, URL encoded)

**Optional Parameters:** Same as Transfer Request ADA

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "yoroi://yoroi-wallet.com/w1/browser/launch?dappUrl=https%3A%2F%2Fsteelswap.io%2Fswap%3Finput%3D%26output%3Dfe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
```

### Cardano Links (`web+cardano://`)

#### 5. Claim Link

**Authority:** `claim/v1`

**Required Parameters:**

- `code`: Claim code
- `faucet_url`: Faucet URL

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://claim/v1?code=TEST123&faucet_url=https%3A%2F%2Ftestnet-faucet.example.com"
```

#### 6. Browse Link (CIP-158)

**Authority:** `browse/v1`

**Required Parameters:**

- `scheme`: URL scheme (e.g., `https`)
- `namespaced_domain`: Namespaced domain (e.g., `com.sundaeswap`)

**Optional Parameters:**

- `app_path`: Application path
- `url`: Full URL

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://browse/v1?scheme=https&namespaced_domain=io.steelswap&app_path=/swap&url=https%3A%2F%2Fsteelswap.io%2Fswap%3Finput%3D%26output%3Dfe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"
```

#### 7. Pay Link (CIP-PR843)

**Authority:** `pay/v1`

**Required Parameters:**

- `address`: Wallet address

**Optional Parameters:**

- `amount`: Amount in atomic units
- `asset`: Asset identifier
- `memo`: Memo string

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://pay/v1?address=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&amount=1000000&memo=Test+payment"
```

#### 8. Legacy Payment Link (CIP-13)

**Authority:** `payment` (or empty authority)

**Required Parameters:**

- Address in the authority or `address` param

**Optional Parameters:**

- `amount`: Amount in atomic units
- `asset`: Asset identifier
- `memo`: Memo string

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2?amount=1000000&memo=Legacy+payment+test"
```

#### 9. Stake Pool Link

**Authority:** `stake/v1`

**Required Parameters:**

- `pool`: Pool ID

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://stake/v1?pool=b19f2d9498845652ae6eea5da77952b37e2bca9f59b2a98c56694cae"
```

#### 10. Transaction Link (CIP-107)

**Authority:** `transaction/v1`

**Required Parameters:**

- `hash`: Transaction hash

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://transaction/v1?hash=f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846"
```

#### 11. Block Link (CIP-107)

**Authority:** `block/v1`

**Optional Parameters:**

- `hash`: Block hash
- `height`: Block height

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://block/v1?hash=f149785c881f9ae68e4e958d8ba2d9e84571a1d49d5a9daee12f693f87a27846&height=12345678"
```

#### 12. Address Link (CIP-134)

**Authority:** `address/v1`

**Required Parameters:**

- `address`: Wallet address

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://address/v1?address=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2"
```

#### 13. Connect Link (P2P)

**Authority:** `connect/v1`

**Required Parameters:**

- `peerId`: Peer ID for P2P connection

**Optional Parameters:**

- `signalingUrl`: Signaling server URL

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "web+cardano://connect/v1?peerId=peer123&signalingUrl=https%3A%2F%2Fsignaling.example.com"
```

### Universal Links (`https://yoroi-wallet.com/w1/...`)

Universal links use the same paths as Yoroi links but with `https://` scheme. They require app links verification.

**Example:**

```bash
adb shell am start -W -a android.intent.action.VIEW -d "https://yoroi-wallet.com/w1/transfer/request/ada?targets[0][receiver]=addr1q9shdvgxddemdxkdwp493le8yhengzk6fuwsewzx42sjpjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0ql6fur2&targets[0][amounts][0][tokenId]=.&targets[0][amounts][0][quantity]=1000000"
```

## Testing Individual Links

You can test individual link types by copying the specific command from the test script or using the examples above.

## Parameters Reference

### PartnerInfoParams (available for all Yoroi links)

- **isSandbox** (`boolean`, optional): When `true`, deeplinks only work on non-production builds
- **isTestnet** (`boolean`, optional): Restricts to mainnet (`false`) or testnet (`true`) wallets
- **appId** (`string`, max 40 chars, optional): Identifies the partner app
- **redirectTo** (`string`, max 2048 chars, optional): HTTPS URL for redirect after action
- **authorization** (`string`, max 256 chars, optional): UUID authorization token (must be passed back)
- **message** (`string`, max 256 chars, optional): User-facing message
- **walletId** (`string`, max 40 chars, optional): UUID of the wallet (must be passed back)
- **signature** (`string`, max 256 chars, optional): Partner signature (affects warnings)

## Notes

1. **URL Encoding**: Always URL encode special characters in URLs. The test script includes a helper function for this.

2. **Array Parameters**: Yoroi uses array notation like `targets[0][receiver]` for array parameters.

3. **Package Names**:

   - Production: `com.emurgo`
   - Development: `com.emurgo.dev`

4. **Sandbox Mode**: Links with `isSandbox=true` only work in development builds (`__DEV__ === true`).

5. **Validation**: Yoroi validates links strictly. Missing optional params are fine, but extra unknown params will cause the link to be ignored.

6. **Authorization & WalletId**: When provided, these must be passed back in subsequent requests for the flow to continue.

## Existing Test Scripts

- `scripts/request-ada-with-link-android.sh` - Tests ADA transfer with link
- `scripts/request-ada-with-link-ios.sh` - iOS version of the above
- `scripts/test-all-links-android.sh` - Comprehensive test script for all link types
