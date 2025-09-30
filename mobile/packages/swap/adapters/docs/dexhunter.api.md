# API Documentation

**\[NOTE] On all requests you must provide X-Partner-Id with the Api Key generated on <https://app.dexhunter.io/partners> -> Dashboard Tab**

**\[NOTE] Base API URL:** [**https://api-us.dexhunterv3.app**](https://api-us.dexhunterv3.app/)

**1. Token List (Verified and Unverified Tokens)**

Fetches a list of verified or unverified tokens based on search criteria.

**Endpoint: `GET /swap/tokens`**

- **Parameters**:
  - `query`: The search input string for token filtering.
  - `verified`: Boolean to specify whether to fetch verified (`true`) or unverified (`false`) tokens.

**Example Request:**

```http
GET /swap/tokens?query=name&verified=true
```

**Response:**

```json
[
  {
    "token_id": "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b",
    "ticker": "ADA",
    "token_ascii": "Cardano",
    "is_verified": true
  },
  {
    "token_id": "f87f9a14bb2c3dfbbacccd631d927a3f5",
    "ticker": "TEST",
    "token_ascii": "Test Token",
    "is_verified": false
  }
]
```

---

**2. Pools (Liquidity Pool Information)**

Fetches liquidity pool data for a given token pair.

**Endpoint: `GET /stats/pools/{tokenIdSell}/{tokenIdBuy}`**

- **Parameters**:
  - `tokenIdSell`: The ID of the token being sold.
  - `tokenIdBuy`: The ID of the token being purchased.

**Example Request:**

```http
httpCopy codeGET /stats/pools/ADA/279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b
```

**Response:**

```json
{
  "pool_id": "pool1xyz...",
  "token_in": "ADA",
  "token_out": "USDT",
  "liquidity": {
    "total_in": 100000,
    "total_out": 95000
  },
  "pool_fee": 0.003,
  "price": 1.05
}
```

---

**3. Token Information**

Fetches details for a specific token, including verification status and metadata.

**Endpoint: `GET /swap/token/{tokenId}`**

- **Parameters**:
  - `tokenId`: The unique ID of the token.

**Example Request:**

```http
GET /swap/token/279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b
```

**Response:**

```json
{
  "token_id": "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b",
  "ticker": "ADA",
  "token_ascii": "Cardano",
  "is_verified": true,
  "total_supply": 45000000000,
  "decimals": 6
}
```

**Error Handling:**

- If a token is not found, a fallback mechanism will attempt to parse the token details from the ID:

  ```json
  {
    "token_id": "unverified_token_id",
    "token_policy": "policy_id_part_of_token_id",
    "token_ascii": "Parsed ASCII",
    "is_verified": false,
    "ticker": "Parsed Ticker"
  }
  ```

#### **4. Estimation of Swap Order**

The **estimate** API call is used to estimate the swap details for a specific trade. It provides details such as the input and output amounts, possible routes, and bonus outputs, based on the provided sell or buy amounts.

**Request: Estimate Swap**

**Endpoint:** `POST /estimate`

**Payload:**

```json
{
  "amount_in": 1000, // Amount being sold
  "token_in": "token_id_for_selling", // ID of the token being sold
  "token_out": "token_id_for_buying", // ID of the token being bought
  "slippage": 0.5, // Slippage tolerance
  "blacklisted_dexes": ["DEX1", "DEX2"] // List of blacklisted DEXes
}
```

**Response:**

```json
{
  "total_input_without_slippage": 1000,
  "total_output_without_slippage": 950,
  "possible_routes": [...],  // Array of potential swap routes
  "bonus_output": "+5 ADA"  // Bonus output for the swap
}
```

**Description:**

- `amount_in`: The amount you are selling (in base units).
- `token_in`: The token being sold (its ID).
- `token_out`: The token you want to buy (its ID).
- `slippage`: The acceptable slippage for the transaction.
- `blacklisted_dexes`: A list of DEXes to avoid during the trade.
- **Response Fields**:
  - `total_input_without_slippage`: The total amount of tokens being sold without considering slippage.
  - `total_output_without_slippage`: The estimated amount of tokens you will receive without considering slippage.
  - `possible_routes`: Potential routes for the trade.
  - `bonus_output`: The bonus output, if applicable.

---

#### **5. Estimation of Price (Average Price)**

The **averagePrice** API call is used to fetch the average exchange rate for a given token pair.

**Request: Average Price for Token Pair**

**Endpoint:** `GET /swap/averagePrice/{sellTokenId}/{buyTokenId}`

**Example Request:**

```plaintext
GET /swap/averagePrice/ADA/279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b
```

**Response:**

```json
{
  "price_ba": 1.234, // 1 Token = X ADA
  "price_ab": 1.2 // 1 ADA = x Token
}
```

**Description:**

- **Request Path Variables**:
  - `sellTokenId`: The ID of the token you are selling (e.g., `ADA`).
  - `buyTokenId`: The ID of the token you want to buy (e.g., `USDT`).
- **Response Fields**:
  - `price_ba`: The average price for the given token pair, in base units (1 Token = X ADA)
  - `price_ab`: A secondary price representation (1 ADA = x Token)

---

#### **6. Swap Operation (Submit a Swap)**

The **swap** operation involves submitting a swap request where tokens are exchanged, and the transaction is signed and submitted.

**Request: Initiate Swap**

**Endpoint:** `POST /swap/build`

**Payload:**

```json
{
  "buyer_address": "user_address", // The address of the user initiating the swap
  "token_in": "token_id_for_selling", // ID of the token being sold
  "token_out": "token_id_for_buying", // ID of the token being bought
  "slippage": 0.5, // Slippage tolerance
  "amount_in": 1000, // Amount being sold
  "tx_optimization": true, // Whether to optimize for multiple DEXes
  "blacklisted_dexes": ["DEX1", "DEX2"] // List of blacklisted DEXes
}
```

**Response:**

```json
{
  "cbor": "transaction_cbor_data", // The CBOR encoded transaction data
  "status": "pending" // The status of the swap
}
```

**Description:**

- `buyer_address`: The address of the user making the purchase.
- `token_in`: The token being sold.
- `token_out`: The token being purchased.
- `slippage`: The maximum slippage allowed for the transaction.
- `amount_in`: The amount of tokens being sold.
- `tx_optimization`: Whether to optimize the transaction across multiple DEXes.
- `blacklisted_dexes`: A list of DEXes to avoid.
- **Response Fields**:
  - `cbor`: The CBOR-encoded transaction data, which will be signed.
  - `status`: The initial status of the swap transaction.

---

**Request: Sign the Transaction**

Once the swap request has been created, it needs to be signed using the wallet API.

**Endpoint:** `POST /swap/sign`

**Payload:**

```json
{
  "txCbor": "transaction_cbor_data", // The CBOR transaction data to be signed
  "signatures": ["signature_1", "signature_2"] // List of signatures
}
```

**Response:**

```json
{
  "cbor": "signed_cbor_data", // The signed transaction data
  "strat_id": "strategy_id" // The strategy ID for this transaction, if applicable
}
```

---

**Request: Submit the Signed Transaction**

After the transaction is signed, it can be submitted to the blockchain.

**User submits tx themselves either via wallet api or library api**

**Example:**

````json
```typescript
const tx = await api.submitTx(sign.cbor);
```
````

**Where api is cip30 wallet**

---

#### **Sample Flow of Swap Operation**

1. **Initiate Swap**: First, initiate the swap by sending a `POST` request to `/swap` with the appropriate payload.
2. **Sign Transaction**: Next, sign the transaction by sending a `POST` request to `/swap/sign` with the transaction's CBOR data and signatures.
3. **Submit Transaction**: Finally, submit the signed transaction using the `wallet submit api or your own node/infrastructure provider.`

---

#### **Error Handling**

If the estimation or swap operation encounters an error, the system will respond with appropriate error messages such as:

- **Not Enough Liquidity**: When there's not enough liquidity to perform the swap.
- **Pool Out of Sync**: When the liquidity pool data is not in sync.
- **Input Too Small**: When the input amount is too small to be processed.

---

#### **DEX Blacklist Example**

The **DEX Blacklist** is used to avoid certain decentralized exchanges (DEXes) during the swap operation. Here is an example of the DEX blacklist array that can be included in the payload when making a swap request:

**DEX Blacklist Array**

```json
[
  "SUNDAESWAPV3",
  "SPLASH",
  "MINSWAPV2",
  "MINSWAP",
  "AXO",
  "WINGRIDER",
  "WINGRIDERV2",
  "SNEKFUN",
  "SPECTRUM",
  "SUNDAESWAP",
  "VYFI",
  "MUESLISWAP"
]
```

This array represents a list of DEXes that should be avoided during the swap transaction.

---

#### **Code Snippet for Swap Action (Tx Building, Signing, and Submission)**

Here’s an example of how to build the full transaction for the swap action, including signing and submitting the transaction using the `api.signTx` and `api.submitTx` methods.

**1. Build Swap Payload**

```javascript
const buildSwapPayload = () => {
  const swapPayload = {
    buyer_address: userAddress, // The buyer's address
    token_in: tokenSell?.token_id, // Token being sold
    token_out: tokenBuy?.token_id, // Token being bought
    slippage: adjustedSlippage, // The acceptable slippage for the swap
    amount_in: formatAmount(), // The amount to be swapped
    tx_optimization: isDexSplitting, // Whether to optimize the swap for multiple DEXes
    blacklisted_dexes: adjustedDexBlacklist, // The DEXes to be avoided during the swap
  }

  return swapPayload
}
```

**2. Sending the Swap Request to Server**

```javascript
const sendSwapRequest = async (swapPayload) => {
  try {
    const {data: swap} = await server.post(routingMapping.swap, swapPayload)
    return swap // Response containing CBOR transaction data
  } catch (err) {
    console.error('Error sending swap request:', err)
    throw new Error('Error sending swap request')
  }
}
```

**3. Signing the Transaction**

```javascript
const signTransaction = async (swap) => {
  try {
    const signatures = await api?.signTx(swap?.cbor, true) // Signing the transaction
    return signatures
  } catch (err) {
    console.error('Error signing transaction:', err)
    throw new Error('Error signing transaction')
  }
}
```

**4. Submitting the Signed Transaction**

```javascript
const submitTransaction = async (signatures, swap) => {
  try {
    const {data: sign} = await server.post(`/swap/sign`, {
      txCbor: swap?.cbor, // The transaction CBOR data
      signatures, // The signatures for the transaction
    })

    // Submit the signed transaction
    const tx = await api?.submitTx(sign?.cbor)
    return tx // The transaction hash after submission
  } catch (err) {
    console.error('Error submitting transaction:', err)
    throw new Error('Error submitting transaction')
  }
}
```

**5. Full Swap Flow:**

```javascript
const executeSwap = async () => {
  const swapPayload = buildSwapPayload() // Step 1: Build the payload
  const swap = await sendSwapRequest(swapPayload) // Step 2: Send the swap request to the server
  const signatures = await signTransaction(swap) // Step 3: Sign the transaction
  const tx = await submitTransaction(signatures, swap) // Step 4: Submit the signed transaction

  // You can now handle the transaction result (e.g., showing a success message)
  console.log('Swap transaction successful with tx hash:', tx)
}
```

---

#### **Flow Explanation:**

1. **Build the Swap Payload**: The `buildSwapPayload` function creates a payload with all the necessary data for the swap request, including the tokens involved, slippage, and blacklisted DEXes.
2. **Send Swap Request**: The `sendSwapRequest` function sends a request to the server to initiate the swap, returning the CBOR transaction data (`swap.cbor`).
3. **Sign Transaction**: The `signTransaction` function uses the `api.signTx` method to sign the transaction, ensuring it can be submitted on the blockchain.
4. **Submit Transaction**: The `submitTransaction` function sends the signed transaction data to the server, which submits it to the blockchain, and returns the transaction hash (`tx`).

By following this flow, you can ensure that the swap operation is fully executed, from request creation to final transaction submission.

## Swagger docs

```
{
    "schemes": ["https"],
    "swagger": "2.0",
    "info": {
        "description": "This is the API for the Dexhunter project",
        "title": "Dexhunter API",
        "contact": {
            "email": "support@dexhunter.io"
        },
        "version": "1.0"
    },
    "host": "api-us.dexhunterv3.app",
    "basePath": "/",
    "paths": {
        "/swap/averagePrice/{tokenInId}/{tokenOutId}": {
            "get": {
                "description": "Get Average Price",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Get Average Price",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        },
        "/swap/cancel": {
            "post": {
                "description": "Cancel",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Cancel",
                "parameters": [
                    {
                        "description": "Cancel Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.CancelRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.CancelResponse"
                        }
                    }
                }
            }
        },
        "/swap/estimate": {
            "post": {
                "description": "Estimate a trade",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Estimate Trade",
                "parameters": [
                    {
                        "description": "Estimate Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.EstimateRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.EstimateResponse"
                        }
                    }
                }
            }
        },
        "/swap/limit": {
            "post": {
                "description": "Limit Trade",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Limit Trade",
                "parameters": [
                    {
                        "description": "Limit Order Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.LimitOrderRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.LimitOrderResponse"
                        }
                    }
                }
            }
        },
        "/swap/limitEstimate": {
            "post": {
                "description": "Estimate a limit order",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Estimate a limit order",
                "parameters": [
                    {
                        "description": "Limit Order Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.LimitOrderRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.LimitOrderEstimate"
                        }
                    }
                }
            }
        },
        "/swap/orders/{userAddress}": {
            "get": {
                "description": "Get User Orders",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Get User Orders",
                "parameters": [
                    {
                        "type": "string",
                        "description": "User Address",
                        "name": "userAddress",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "array",
                            "items": {
                                "$ref": "#/definitions/models.ApiOrder"
                            }
                        }
                    }
                }
            }
        },
        "/swap/reverseEstimate": {
            "post": {
                "description": "Reverse Estimate a trade",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Reverse Estimate Trade",
                "parameters": [
                    {
                        "description": "Reverse Estimate Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.ReverseEstimationRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.ReverseEstimateResponse"
                        }
                    }
                }
            }
        },
        "/swap/sign": {
            "post": {
                "description": "Sign a transaction",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Sign a transaction",
                "parameters": [
                    {
                        "description": "Submission Model",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.SubmissionModel"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.SignatureResponse"
                        }
                    }
                }
            }
        },
        "/swap/swap": {
            "post": {
                "description": "Swap",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Swap",
                "parameters": [
                    {
                        "description": "Submission Model",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.SwapObject"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.SwapResponse"
                        }
                    }
                }
            }
        },
        "/swap/wallet": {
            "post": {
                "description": "Get wallet information",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Swap"
                ],
                "summary": "Wallet",
                "parameters": [
                    {
                        "description": "Wallet Request",
                        "name": "request",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/dto.Wallet"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dto.WalletInfoResponse"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "dto.CancelRequest": {
            "type": "object",
            "properties": {
                "address": {
                    "type": "string"
                },
                "order_id": {
                    "type": "string"
                }
            }
        },
        "dto.CancelResponse": {
            "type": "object",
            "properties": {
                "additional_cancellation_fee": {
                    "type": "integer"
                },
                "cbor": {
                    "type": "string"
                }
            }
        },
        "dto.EstimateRequest": {
            "type": "object",
            "properties": {
                "amount_in": {
                    "type": "number"
                },
                "blacklisted_dexes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "single_preferred_dex": {
                    "type": "string"
                },
                "slippage": {
                    "type": "number"
                },
                "token_in": {
                    "type": "string"
                },
                "token_out": {
                    "type": "string"
                }
            }
        },
        "dto.EstimateResponse": {
            "type": "object",
            "properties": {
                "average_price": {
                    "type": "number"
                },
                "batcher_fee": {
                    "type": "number"
                },
                "communications": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "deposits": {
                    "type": "number"
                },
                "dexhunter_fee": {
                    "type": "number"
                },
                "net_price": {
                    "type": "number"
                },
                "net_price_reverse": {
                    "type": "number"
                },
                "partner_code": {
                    "type": "string"
                },
                "partner_fee": {
                    "type": "number"
                },
                "possible_routes": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "number"
                    }
                },
                "splits": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Split"
                    }
                },
                "total_fee": {
                    "type": "integer"
                },
                "total_output": {
                    "type": "number"
                },
                "total_output_without_slippage": {
                    "type": "number"
                }
            }
        },
        "dto.LimitOrderEstimate": {
            "type": "object",
            "properties": {
                "batcher_fee": {
                    "type": "number"
                },
                "blacklisted_dexes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "deposits": {
                    "type": "number"
                },
                "dexhunter_fee": {
                    "type": "integer"
                },
                "net_price": {
                    "type": "number"
                },
                "partner": {
                    "type": "string"
                },
                "partner_fee": {
                    "type": "number"
                },
                "possible_routes": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                },
                "splits": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Split"
                    }
                },
                "total_fee": {
                    "type": "number"
                },
                "total_input": {
                    "type": "number"
                },
                "total_output": {
                    "type": "number"
                }
            }
        },
        "dto.LimitOrderRequest": {
            "type": "object",
            "properties": {
                "amount_in": {
                    "type": "number"
                },
                "blacklisted_dexes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "buyer_address": {
                    "type": "string"
                },
                "dex": {
                    "type": "string"
                },
                "multiples": {
                    "type": "integer"
                },
                "token_in": {
                    "type": "string"
                },
                "token_out": {
                    "type": "string"
                },
                "wanted_price": {
                    "type": "number"
                }
            }
        },
        "dto.LimitOrderResponse": {
            "type": "object",
            "properties": {
                "batcher_fee": {
                    "type": "number"
                },
                "cbor": {
                    "type": "string"
                },
                "deposits": {
                    "type": "number"
                },
                "dexhunter_fee": {
                    "type": "integer"
                },
                "partner": {
                    "type": "string"
                },
                "partner_fee": {
                    "type": "number"
                },
                "possible_routes": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                },
                "splits": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Split"
                    }
                },
                "totalFee": {
                    "type": "number"
                },
                "total_input": {
                    "type": "number"
                },
                "total_output": {
                    "type": "number"
                }
            }
        },
        "dto.OrderFilter": {
            "type": "object",
            "properties": {
                "filterType": {
                    "$ref": "#/definitions/dto.OrderFilterType"
                },
                "values": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "dto.OrderFilterType": {
            "type": "string",
            "enum": [
                "TOKENID",
                "STATUS",
                "TXTYPE",
                "TIMESTART",
                "TIMEEND",
                "DEXNAME",
                "SEARCH",
                "ADDRESS",
                "MINAMOUNT",
                "MAXAMOUNT",
                "TXHASH",
                "OWNED"
            ],
            "x-enum-varnames": [
                "TOKENID",
                "STATUS",
                "TXTYPE",
                "TIMESTART",
                "TIMEEND",
                "DEXNAME",
                "SEARCH",
                "ADDRESS",
                "MINAMOUNT",
                "MAXAMOUNT",
                "TXHASH",
                "OWNED"
            ]
        },
        "dto.OrderRequest": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/dto.OrderFilter"
                    }
                },
                "orderSorts": {
                    "$ref": "#/definitions/dto.OrderSorts"
                },
                "page": {
                    "type": "integer"
                },
                "perPage": {
                    "type": "integer"
                },
                "sortDirection": {
                    "$ref": "#/definitions/dto.SortDirection"
                }
            }
        },
        "dto.OrderSorts": {
            "type": "string",
            "enum": [
                "AMOUNTIN",
                "DATE"
            ],
            "x-enum-varnames": [
                "AMOUNTIN",
                "DATE"
            ]
        },
        "dto.ReverseEstimateResponse": {
            "type": "object",
            "properties": {
                "average_price": {
                    "type": "number"
                },
                "batcher_fee": {
                    "type": "number"
                },
                "communications": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "deposits": {
                    "type": "number"
                },
                "dexhunter_fee": {
                    "type": "number"
                },
                "net_price": {
                    "type": "number"
                },
                "net_price_reverse": {
                    "type": "number"
                },
                "partner_fee": {
                    "type": "number"
                },
                "possible_routes": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "number"
                    }
                },
                "price_ab": {
                    "type": "number"
                },
                "price_ba": {
                    "type": "number"
                },
                "splits": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Split"
                    }
                },
                "total_fee": {
                    "type": "integer"
                },
                "total_input": {
                    "type": "number"
                },
                "total_input_without_slippage": {
                    "type": "number"
                },
                "total_output": {
                    "type": "number"
                }
            }
        },
        "dto.ReverseEstimationRequest": {
            "type": "object",
            "required": [
                "slippage",
                "token_in",
                "token_out"
            ],
            "properties": {
                "amount_out": {
                    "type": "number",
                    "example": 2
                },
                "blacklisted_dexes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "example": [
                        ""
                    ]
                },
                "buyer_address": {
                    "type": "string",
                    "example": "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh"
                },
                "is_optimized": {
                    "type": "boolean",
                    "example": false
                },
                "slippage": {
                    "type": "number",
                    "example": 2
                },
                "token_in": {
                    "type": "string",
                    "example": ""
                },
                "token_out": {
                    "type": "string",
                    "example": "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b"
                }
            }
        },
        "dto.SignatureResponse": {
            "type": "object",
            "properties": {
                "cbor": {
                    "type": "string"
                },
                "strat_id": {
                    "type": "string"
                }
            }
        },
        "dto.SortDirection": {
            "type": "string",
            "enum": [
                "ASC",
                "DESC"
            ],
            "x-enum-varnames": [
                "ASC",
                "DESC"
            ]
        },
        "dto.SubmissionModel": {
            "type": "object",
            "properties": {
                "Signatures": {
                    "type": "string"
                },
                "txCbor": {
                    "type": "string"
                }
            }
        },
        "dto.SwapObject": {
            "type": "object",
            "required": [
                "amount_in",
                "buyer_address",
                "slippage",
                "token_in",
                "token_out"
            ],
            "properties": {
                "amount_in": {
                    "type": "number",
                    "example": 1
                },
                "blacklisted_dexes": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "example": [
                        ""
                    ]
                },
                "buyer_address": {
                    "type": "string",
                    "example": "addr1qxajla3qcrwckzkur8n0lt02rg2sepw3kgkstckmzrz4ccfm3j9pqrqkea3tns46e3qy2w42vl8dvvue8u45amzm3rjqvv2nxh"
                },
                "inputs": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "example": [
                        "array of utxos in CBORHEX"
                    ]
                },
                "slippage": {
                    "type": "number",
                    "example": 2
                },
                "token_in": {
                    "type": "string",
                    "example": ""
                },
                "token_out": {
                    "type": "string",
                    "example": "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b"
                }
            }
        },
        "dto.SwapResponse": {
            "type": "object",
            "properties": {
                "average_price": {
                    "type": "number"
                },
                "batcher_fee": {
                    "type": "number"
                },
                "cbor": {
                    "type": "string",
                    "example": ""
                },
                "communications": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "deposits": {
                    "type": "number"
                },
                "dexhunter_fee": {
                    "type": "number"
                },
                "net_price": {
                    "type": "number"
                },
                "net_price_reverse": {
                    "type": "number"
                },
                "partner_code": {
                    "type": "string"
                },
                "partner_fee": {
                    "type": "number"
                },
                "possible_routes": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "number"
                    }
                },
                "splits": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Split"
                    }
                },
                "total_fee": {
                    "type": "integer"
                },
                "total_input": {
                    "type": "number"
                },
                "total_input_without_slippage": {
                    "type": "number"
                },
                "total_output": {
                    "type": "number"
                },
                "total_output_without_slippage": {
                    "type": "number"
                }
            }
        },
        "models.ApiOrder": {
            "type": "object",
            "properties": {
                "_id": {
                    "type": "string"
                },
                "actual_out_amount": {
                    "type": "number"
                },
                "amount_in": {
                    "type": "number"
                },
                "batcher_fee": {
                    "type": "number"
                },
                "deposit": {
                    "type": "number"
                },
                "dex": {
                    "type": "string"
                },
                "expected_out_amount": {
                    "type": "number"
                },
                "is_dexhunter": {
                    "type": "boolean"
                },
                "is_oor": {
                    "type": "boolean"
                },
                "is_stop_loss": {
                    "type": "boolean"
                },
                "last_update": {
                    "type": "string"
                },
                "output_index": {
                    "type": "integer"
                },
                "status": {
                    "type": "string"
                },
                "submission_time": {
                    "type": "string"
                },
                "token_id_in": {
                    "type": "string"
                },
                "token_id_out": {
                    "type": "string"
                },
                "tx_hash": {
                    "type": "string"
                },
                "update_tx_hash": {
                    "type": "string"
                },
                "user_address": {
                    "type": "string"
                },
                "user_stake": {
                    "type": "string"
                }
            }
        },
        "models.Split": {
            "type": "object",
            "properties": {
                "amount_in": {
                    "type": "number"
                },
                "batcher_fee": {
                    "type": "number"
                },
                "deposits": {
                    "type": "number"
                },
                "dex": {
                    "type": "string"
                },
                "expected_output": {
                    "type": "number"
                },
                "expected_output_without_slippage": {
                    "type": "number"
                },
                "fee": {
                    "type": "number"
                },
                "final_price": {
                    "type": "number"
                },
                "initial_price": {
                    "type": "number"
                },
                "pool_fee": {
                    "type": "number"
                },
                "pool_id": {
                    "type": "string"
                },
                "price_distortion": {
                    "type": "number"
                },
                "price_impact": {
                    "type": "number"
                }
            }
        }
    }
}
```
