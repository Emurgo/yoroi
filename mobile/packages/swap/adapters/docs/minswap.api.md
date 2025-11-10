# Aggregator API

## GET /ada-price

> Get current ADA price in multiple currencies

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/ada-price": {
      "get": {
        "summary": "Get current ADA price in multiple currencies",
        "parameters": [
          {
            "name": "currency",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "enum": [
                "aed",
                "ars",
                "aud",
                "bdt",
                "bhd",
                "bmd",
                "brl",
                "cad",
                "chf",
                "clp",
                "cny",
                "czk",
                "dkk",
                "eur",
                "gbp",
                "hkd",
                "huf",
                "idr",
                "ils",
                "inr",
                "jpy",
                "krw",
                "kwd",
                "lkr",
                "mmk",
                "mxn",
                "myr",
                "ngn",
                "nok",
                "nzd",
                "php",
                "pkr",
                "pln",
                "rub",
                "sar",
                "sek",
                "sgd",
                "thb",
                "try",
                "twd",
                "uah",
                "usd",
                "vef",
                "vnd",
                "xdr",
                "zar"
              ]
            },
            "description": "Currency code to get ADA price in.\nCommon values: usd, eur, jpy.\n"
          }
        ],
        "responses": {
          "200": {
            "description": "Current ADA price and 24-hour change in requested currency",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "currency": {
                      "type": "string",
                      "description": "The requested currency code in lowercase\nExample: \"usd\", \"eur\", \"gbp\"\n"
                    },
                    "value": {
                      "type": "object",
                      "nullable": true,
                      "description": "Price information (null if price data unavailable)\n",
                      "properties": {
                        "change_24h": {
                          "type": "number",
                          "description": "24-hour price change percentage\n- Positive value: price increased\n- Negative value: price decreased\nExample: -2.34 means price dropped 2.34%\n"
                        },
                        "price": {
                          "type": "number",
                          "description": "Current price in the requested currency\nExample: 0.75 means 1 ADA = $0.75 USD\n"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## GET /wallet

> Query wallet balances and token information

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/wallet": {
      "get": {
        "summary": "Query wallet balances and token information",
        "parameters": [
          {
            "name": "address",
            "in": "query",
            "required": true,
            "schema": {"type": "string"},
            "description": "Cardano wallet address to query\n- Supports both Cbor and Hex format addresses\n- Will be normalized to Cbor format in response\n"
          },
          {
            "name": "amount_in_decimal",
            "in": "query",
            "required": false,
            "schema": {"type": "boolean"},
            "description": "If true, all token balances are returned as decimal strings (e.g., \"1.5\" ADA),\nnot the smallest unit (e.g., \"1500000\" lovelace). If false or omitted, balances are in smallest unit.\n"
          }
        ],
        "responses": {
          "200": {
            "description": "Detailed wallet balance information including ADA and native tokens",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "wallet": {
                      "type": "string",
                      "description": "The wallet address in cbor format\nExample: \"addr1...\"\n"
                    },
                    "ada": {
                      "type": "string",
                      "description": "ADA balance.\n- 1 ADA = 1,000,000 lovelace\n- Returned as string to handle large numbers accurately\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "minimum_lovelace": {
                      "type": "string",
                      "description": "Minimum required ADA for the wallet.\nThis represents the minimum ADA required to hold native tokens due to the Cardano protocol's UTxO rules.\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "balance": {
                      "type": "array",
                      "description": "Array of token balances held in the wallet.\nEach entry represents a different token's balance and metadata.\nADA (lovelace) is not included here as it has its own field 'ada'.\n",
                      "items": {
                        "type": "object",
                        "description": "Token balance entry with asset information",
                        "properties": {
                          "asset": {
                            "$ref": "#/components/schemas/Asset",
                            "description": "Detailed information about the token"
                          },
                          "amount": {
                            "type": "string",
                            "description": "Token balance\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\nNote: Always returned as string to handle large numbers accurately\n"
                          }
                        }
                      }
                    },
                    "amount_in_decimal": {
                      "type": "boolean",
                      "description": "Whether amount_in_decimal is enabled or not"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Asset": {
        "type": "object",
        "required": ["token_id"],
        "properties": {
          "token_id": {
            "type": "string",
            "description": "Token identifier, two possible formats:\n- For ADA: use \"lovelace\"\n- For other tokens: concatenate <policyId><tokenName> in hex\nExample: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\" for MIN token\n"
          },
          "logo": {
            "type": "string",
            "nullable": true,
            "description": "Logo url of the token\nCan be null if no logo is available\n"
          },
          "ticker": {
            "type": "string",
            "nullable": true,
            "description": "Token ticker symbol (if available)\nCan be null for tokens without a ticker symbol\nExample: \"MIN\", \"iUSD\", \"DJED\"\n"
          },
          "is_verified": {
            "type": "boolean",
            "nullable": true,
            "description": "Token verification status on Minswap\n- true: Token is verified by Minswap\n- false: Token is not verified\n- null: Verification status unknown\n"
          },
          "price_by_ada": {
            "type": "number",
            "nullable": true,
            "description": "Token price denominated in ADA\nCan be null if price information is unavailable\nExample: 1.5 means 1 token = 1.5 ADA\n"
          },
          "project_name": {
            "type": "string",
            "nullable": true,
            "description": "Name of the project that issued the token\nCan be null for unknown projects\nExample: \"Minswap\", \"Indigo\"\n"
          },
          "decimals": {
            "type": "number",
            "nullable": true,
            "description": "Number of decimal places for the token\n- ADA always has 6 decimals (1 ADA = 1,000,000 lovelace)\n- Most tokens follow the 6 decimal standard\n- Can be null for tokens with unknown decimals\nExample: 6 means divide by 1,000,000 to get actual amount\n"
          }
        }
      }
    }
  }
}
```

## Search and filter token information with pagination

> Search for tokens with optional filtering and pagination support. Results can be filtered\
> to only show verified tokens, specific token IDs, or tokens matching a search query.\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/tokens": {
      "post": {
        "summary": "Search and filter token information with pagination",
        "description": "Search for tokens with optional filtering and pagination support. Results can be filtered\nto only show verified tokens, specific token IDs, or tokens matching a search query.\n",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["query", "only_verified"],
                "properties": {
                  "query": {
                    "type": "string",
                    "description": "Search query string to match against:\n- Token name (e.g., \"Minswap\")\n- Token ticker (e.g., \"MIN\")\n- Policy ID\nEmpty string returns all tokens (subject to other filters)\n"
                  },
                  "only_verified": {
                    "type": "boolean",
                    "description": "When true, returns only tokens verified by Minswap\n- true: Only verified tokens\n- false: All tokens including unverified ones\n"
                  },
                  "assets": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional list of specific token_ids to fetch\nFormat: Array of \"<policyId><tokenName>\" strings\nExample: [\"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\"]\n"
                  },
                  "search_after": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Pagination cursor from previous response\n"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Token search results with pagination information",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tokens": {
                      "type": "array",
                      "description": "Array of tokens matching the search criteria.\nMay be empty if no tokens match or all are filtered out.\n",
                      "items": {"$ref": "#/components/schemas/Asset"}
                    },
                    "search_after": {
                      "type": "array",
                      "items": {"type": "string"},
                      "description": "Pagination cursor for the next page\n"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Asset": {
        "type": "object",
        "required": ["token_id"],
        "properties": {
          "token_id": {
            "type": "string",
            "description": "Token identifier, two possible formats:\n- For ADA: use \"lovelace\"\n- For other tokens: concatenate <policyId><tokenName> in hex\nExample: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\" for MIN token\n"
          },
          "logo": {
            "type": "string",
            "nullable": true,
            "description": "Logo url of the token\nCan be null if no logo is available\n"
          },
          "ticker": {
            "type": "string",
            "nullable": true,
            "description": "Token ticker symbol (if available)\nCan be null for tokens without a ticker symbol\nExample: \"MIN\", \"iUSD\", \"DJED\"\n"
          },
          "is_verified": {
            "type": "boolean",
            "nullable": true,
            "description": "Token verification status on Minswap\n- true: Token is verified by Minswap\n- false: Token is not verified\n- null: Verification status unknown\n"
          },
          "price_by_ada": {
            "type": "number",
            "nullable": true,
            "description": "Token price denominated in ADA\nCan be null if price information is unavailable\nExample: 1.5 means 1 token = 1.5 ADA\n"
          },
          "project_name": {
            "type": "string",
            "nullable": true,
            "description": "Name of the project that issued the token\nCan be null for unknown projects\nExample: \"Minswap\", \"Indigo\"\n"
          },
          "decimals": {
            "type": "number",
            "nullable": true,
            "description": "Number of decimal places for the token\n- ADA always has 6 decimals (1 ADA = 1,000,000 lovelace)\n- Most tokens follow the 6 decimal standard\n- Can be null for tokens with unknown decimals\nExample: 6 means divide by 1,000,000 to get actual amount\n"
          }
        }
      }
    }
  }
}
```

## Get optimal swap route and price estimation across DEX protocols

> Find the best possible swap route and price estimation by aggregating liquidity\
> across multiple DEX protocols. Supports direct swaps and multi-hop routing.\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/estimate": {
      "post": {
        "summary": "Get optimal swap route and price estimation across DEX protocols",
        "description": "Find the best possible swap route and price estimation by aggregating liquidity\nacross multiple DEX protocols. Supports direct swaps and multi-hop routing.\n",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["amount", "token_in", "token_out", "slippage"],
                "properties": {
                  "amount": {
                    "type": "string",
                    "description": "Amount of input token.\n- If amount_in_decimal is true: amount is a decimal string (e.g., \"1.5\" ADA)\n- If amount_in_decimal is false or omitted: amount is in the smallest unit (e.g., \"1500000\" lovelace)\nFor ADA: 1 ADA = 1,000,000 lovelace.\nFor other tokens: amount * (10 ^ decimals).\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA or tokens\n- \"1000000\" (with amount_in_decimal=false) means 1 ADA or token with 6 decimals\n"
                  },
                  "token_in": {
                    "type": "string",
                    "description": "Input token identifier:\n- For ADA: use \"lovelace\"\n- For other tokens: use \"<policyId><tokenName>\" format\nExample: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\" for MIN token\n"
                  },
                  "token_out": {
                    "type": "string",
                    "description": "Output token identifier:\n- For ADA: use \"lovelace\"\n- For other tokens: use \"<policyId><tokenName>\" format\nMust be different from token_in\n"
                  },
                  "slippage": {
                    "type": "number",
                    "description": "Maximum acceptable slippage percentage:\n- Examples: 0.5 means 0.5% slippage tolerance\n- Used to calculate min_amount_out\n"
                  },
                  "include_protocols": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Protocol"},
                    "description": "Optional list of DEX protocols to include from routing:\n- Useful for choosing specific DEXs\n- Minswap protocols are always included\n- This overrides exclude_protocols if both are provided\n"
                  },
                  "exclude_protocols": {
                    "type": "array",
                    "items": {"$ref": "#/components/schemas/Protocol"},
                    "description": "Optional list of DEX protocols to exclude from routing:\n- Useful for avoiding specific DEXs\n- Minswap protocols cannot be excluded\n"
                  },
                  "allow_multi_hops": {
                    "type": "boolean",
                    "description": "Control whether multi-hop swaps are allowed:\n- true: Allow routing through multiple pools to find best price\n- false: Only allow direct swaps through a single pool\n\nMulti-hop swaps can often provide better prices by routing through \nintermediate tokens, but may have higher total fees due to multiple swaps.\nExample: ADA -> MIN -> iUSD might be more efficient than direct ADA -> iUSD\n"
                  },
                  "partner": {
                    "type": "string",
                    "description": "Partner identifier for tracking and analytics:\n- Optional string to identify the partner integration\n- Used for volume tracking and potential fee sharing programs\n"
                  },
                  "amount_in_decimal": {
                    "type": "boolean",
                    "description": "If true, the amount field is interpreted as a decimal string (e.g., \"1.5\" ADA),\nnot the smallest unit (e.g., \"1500000\" lovelace). If false or omitted, amount is in smallest unit.\n"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful route estimation response containing detailed information about:\n- Token amounts and minimums\n- Fee breakdowns (LP, DEX, and aggregator fees)\n- Price impact\n- Detailed routing paths through different DEX protocols\n",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "token_in": {
                      "type": "string",
                      "description": "Input token identifier (matches request)\nExample: \"lovelace\" for ADA\n"
                    },
                    "token_out": {
                      "type": "string",
                      "description": "Output token identifier (matches request)\nExample: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\" for MIN\n"
                    },
                    "amount_in": {
                      "type": "string",
                      "description": "Total input amount for the swap.\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "amount_out": {
                      "type": "string",
                      "description": "Expected output amount\nThis is the estimated amount before slippage\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "min_amount_out": {
                      "type": "string",
                      "description": "Minimum output amount considering slippage\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "total_lp_fee": {
                      "type": "string",
                      "description": "Total LP fees across all pools in the route\nSum of all lp_fee values from individual paths\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "total_dex_fee": {
                      "type": "string",
                      "description": "Total DEX protocol fees across all pools in lovelace\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "deposits": {
                      "type": "string",
                      "description": "Total required ADA deposits for output tokens\nRequired by Cardano protocol for holding native tokens\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "avg_price_impact": {
                      "type": "number",
                      "description": "Average price impact percentage across all pools\nLower is better, high values indicate significant market impact\nExample: 0.5 means 0.5% price impact\n"
                    },
                    "paths": {
                      "type": "array",
                      "description": "Detailed routing information through DEX pools\nFor multi-hop routes, contains multiple hops\nFor direct swaps, contains a single hop\n",
                      "items": {
                        "type": "array",
                        "description": "Array of hops in the route\nEach array represents one complete path from input to output token\n",
                        "items": {
                          "type": "object",
                          "description": "Individual swap/hop information through a specific pool\n",
                          "properties": {
                            "pool_id": {
                              "type": "string",
                              "description": "Unique identifier for the liquidity pool\nFormat varies by protocol\n"
                            },
                            "protocol": {
                              "$ref": "#/components/schemas/Protocol",
                              "description": "DEX protocol used for this hop\nEach protocol may have different fee structures\n"
                            },
                            "lp_token": {
                              "type": "string",
                              "description": "Liquidity pool token identifier\n"
                            },
                            "token_in": {
                              "type": "string",
                              "description": "Input token for this specific hop\nFor multi-hop routes, may be different from overall token_in\n"
                            },
                            "token_out": {
                              "type": "string",
                              "description": "Output token for this specific hop\nFor multi-hop routes, may be different from overall token_out\n"
                            },
                            "amount_in": {
                              "type": "string",
                              "description": "Input amount for this hop\nFor multi-hop routes, output of previous hop\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "amount_out": {
                              "type": "string",
                              "description": "Expected output amount for this hop\nFor final hop, contributes to overall amount_out\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "min_amount_out": {
                              "type": "string",
                              "description": "Minimum output amount for this hop with slippage\nEnsures each hop meets minimum requirements\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "lp_fee": {
                              "type": "string",
                              "description": "LP fee amount for this hop\nPaid to liquidity providers\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "dex_fee": {
                              "type": "string",
                              "description": "Protocol fee amount for this hop\nPaid to the DEX protocol\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "deposits": {
                              "type": "string",
                              "description": "Required ADA deposit for this hop\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                            },
                            "price_impact": {
                              "type": "number",
                              "description": "Price impact percentage for this specific hop\nLower values indicate better pricing\n"
                            }
                          }
                        }
                      }
                    },
                    "aggregator_fee": {
                      "type": "string",
                      "description": "Aggregator service fee amount\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                    },
                    "aggregator_fee_percent": {
                      "type": "number",
                      "description": "Aggregator fee percentage\nExample: 0.5\n"
                    },
                    "amount_in_decimal": {
                      "type": "boolean",
                      "description": "Whether amount_in_decimal is enabled or not"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Protocol": {
        "type": "string",
        "enum": [
          "MinswapV2",
          "Minswap",
          "MinswapStable",
          "MuesliSwap",
          "Splash",
          "SundaeSwapV3",
          "SundaeSwap",
          "VyFinance",
          "CswapV1",
          "WingRidersV2",
          "WingRiders",
          "WingRidersStableV2",
          "Spectrum",
          "SplashStable"
        ]
      }
    }
  }
}
```

## Build unsigned swap transaction

> Constructs an unsigned Cardano transaction for performing the swap operation.\
> This endpoint uses the results from /estimate to build a valid transaction\
> that can be signed by the user's wallet and submitted to the network.\
> \
> The transaction will:\
> 1\. Take tokens from the sender's wallet\
> 2\. Execute swaps through specified DEX protocols\
> 3\. Return output tokens to the sender\
> 4\. Handle all necessary ADA deposits and fee payments\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/build-tx": {
      "post": {
        "summary": "Build unsigned swap transaction",
        "description": "Constructs an unsigned Cardano transaction for performing the swap operation.\nThis endpoint uses the results from /estimate to build a valid transaction\nthat can be signed by the user's wallet and submitted to the network.\n\nThe transaction will:\n1. Take tokens from the sender's wallet\n2. Execute swaps through specified DEX protocols\n3. Return output tokens to the sender\n4. Handle all necessary ADA deposits and fee payments\n",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "sender": {
                    "type": "string",
                    "description": "Cardano wallet address that will:\n- Provide the input tokens\n- Pay transaction fees\n- Receive output tokens\n"
                  },
                  "min_amount_out": {
                    "type": "string",
                    "description": "Minimum acceptable output amount\nMust be greater than or equal to the min_amount_out\nfrom the /estimate response to ensure price protection\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                  },
                  "estimate": {
                    "type": "object",
                    "description": "Swap parameters matching a previous /estimate call\nThe transaction will be built according to these parameters\nMust match the exact values used in /estimate to ensure\nthe route and pricing remain valid\n",
                    "properties": {
                      "amount": {
                        "type": "string",
                        "description": "Amount of input tokens\nMust match the amount used in /estimate\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                      },
                      "token_in": {
                        "type": "string",
                        "description": "Input token identifier\nMust match the token_in used in /estimate\nExample: \"lovelace\" for ADA\n"
                      },
                      "token_out": {
                        "type": "string",
                        "description": "Output token identifier\nMust match the token_out used in /estimate\nExample: \"<policy_id><asset_name>\" for native tokens\n"
                      },
                      "slippage": {
                        "type": "number",
                        "description": "Maximum acceptable slippage percentage\nMust match the slippage used in /estimate\nExample: 0.5 for 0.5% slippage tolerance\n"
                      },
                      "include_protocols": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/Protocol"},
                        "description": "Optional list of DEX protocols to include\nMust match include_protocols used in /estimate\n"
                      },
                      "exclude_protocols": {
                        "type": "array",
                        "items": {"$ref": "#/components/schemas/Protocol"},
                        "description": "Optional list of DEX protocols to exclude\nMust match exclude_protocols used in /estimate\n"
                      },
                      "allow_multi_hops": {
                        "type": "boolean",
                        "description": "Whether to allow multi-hop routes\nMust match allow_multi_hops used in /estimate\n"
                      },
                      "partner": {
                        "type": "string",
                        "description": "Partner identifier for fee tracking\nMust match partner used in /estimate if provided\n"
                      }
                    }
                  },
                  "inputs_to_choose": {
                    "type": "array",
                    "description": "Optional list of preferred UTxO inputs to use when building the transaction.\n",
                    "items": {"type": "string"}
                  },
                  "amount_in_decimal": {
                    "type": "boolean",
                    "description": "If true, the amount in the estimate is interpreted as a decimal string (e.g., \"1.5\" ADA),\nnot the smallest unit (e.g., \"1500000\" lovelace). If false or omitted, amount is in smallest unit.\n"
                  }
                },
                "required": ["sender", "min_amount_out", "estimate"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully built unsigned transaction\nThe returned CBOR can be signed by the sender's wallet\n",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "cbor": {
                      "type": "string",
                      "description": "Unsigned transaction in CBOR format\nThis can be:\n1. Signed using the sender's wallet\n2. Submitted to /finalize-and-submit-tx with witness data\n\nExample: \"84a400...\" (hex-encoded CBOR)\n"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Protocol": {
        "type": "string",
        "enum": [
          "MinswapV2",
          "Minswap",
          "MinswapStable",
          "MuesliSwap",
          "Splash",
          "SundaeSwapV3",
          "SundaeSwap",
          "VyFinance",
          "CswapV1",
          "WingRidersV2",
          "WingRiders",
          "WingRidersStableV2",
          "Spectrum",
          "SplashStable"
        ]
      }
    }
  }
}
```

## Submit signed transaction to network

> Submits a signed transaction to the Cardano network. This endpoint should be called\
> after getting the unsigned transaction from /build-tx and signing it with the sender's wallet.\
> \
> The endpoint will:\
> 1\. Validate the transaction and witness data\
> 2\. Submit the transaction to the Cardano network\
> 3\. Return the transaction ID for tracking\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/finalize-and-submit-tx": {
      "post": {
        "summary": "Submit signed transaction to network",
        "description": "Submits a signed transaction to the Cardano network. This endpoint should be called\nafter getting the unsigned transaction from /build-tx and signing it with the sender's wallet.\n\nThe endpoint will:\n1. Validate the transaction and witness data\n2. Submit the transaction to the Cardano network\n3. Return the transaction ID for tracking\n",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "cbor": {
                    "type": "string",
                    "description": "Unsigned transaction CBOR from /build-tx response\nMust be the exact CBOR string received, unmodified\nExample: \"84a400...\" (hex-encoded CBOR)\n"
                  },
                  "witness_set": {
                    "type": "string",
                    "description": "Witness data containing the transaction signature\nGenerated by the sender's wallet when signing\nMust be hex-encoded\nExample: \"a100...\" (hex-encoded witness data)\n"
                  }
                },
                "required": ["cbor", "witness_set"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Transaction successfully submitted to the network\nThe transaction will be processed in the next available block\n",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "tx_id": {
                      "type": "string",
                      "description": "Transaction ID (hash) for tracking\nCan be used to:\n- Monitor transaction status\n- Look up transaction on block explorers\nExample: \"1abc...\" (hex-encoded transaction hash)\n"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## Get list of pending swap orders for a wallet

> Retrieves all pending swap orders for a given wallet address across different DEX protocols.\
> This endpoint is useful for:\
> \- Finding orders that need to be cancelled\
> \- Tracking pending transactions\
> \
> Orders remain pending until they are either:\
> \- Filled (swap completed)\
> \- Cancelled (using /cancel-tx)\
> \- Expired (if the DEX protocol supports expiration)\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/pending-orders": {
      "get": {
        "summary": "Get list of pending swap orders for a wallet",
        "description": "Retrieves all pending swap orders for a given wallet address across different DEX protocols.\nThis endpoint is useful for:\n- Finding orders that need to be cancelled\n- Tracking pending transactions\n\nOrders remain pending until they are either:\n- Filled (swap completed)\n- Cancelled (using /cancel-tx)\n- Expired (if the DEX protocol supports expiration)\n",
        "parameters": [
          {
            "name": "owner_address",
            "in": "query",
            "required": true,
            "schema": {"type": "string"},
            "description": "Cardano wallet address to query pending orders for\nMust be in bech32 format\nExample: \"addr1...\"\n"
          },
          {
            "name": "amount_in_decimal",
            "in": "query",
            "required": false,
            "schema": {"type": "boolean"},
            "description": "If true, all token amounts are returned as decimal strings (e.g., \"1.5\" ADA),\nnot the smallest unit (e.g., \"1500000\" lovelace). If false or omitted, amounts are in smallest unit.\n"
          }
        ],
        "responses": {
          "200": {
            "description": "Successfully retrieved pending orders\nReturns an empty array if no pending orders exist\n",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "orders": {
                      "type": "array",
                      "description": "List of pending orders for the wallet\n",
                      "items": {
                        "type": "object",
                        "properties": {
                          "owner_address": {
                            "type": "string",
                            "description": "Wallet address that created the order"
                          },
                          "protocol": {
                            "$ref": "#/components/schemas/Protocol",
                            "description": "DEX protocol where the order was placed"
                          },
                          "token_in": {
                            "$ref": "#/components/schemas/Asset",
                            "description": "Token being sold in this order"
                          },
                          "token_out": {
                            "$ref": "#/components/schemas/Asset",
                            "description": "Token being bought in this order"
                          },
                          "amount_in": {
                            "type": "string",
                            "description": "Amount of input token committed to the order\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                          },
                          "min_amount_out": {
                            "type": "string",
                            "description": "Minimum amount of output token to receive\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                          },
                          "created_at": {
                            "type": "number",
                            "description": "Unix timestamp (ms) when the order was created"
                          },
                          "tx_in": {
                            "type": "string",
                            "description": "Transaction input pointer (TxHash#Index) for the order"
                          },
                          "dex_fee": {
                            "type": "string",
                            "description": "DEX protocol fee amount\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                          },
                          "deposit": {
                            "type": "string",
                            "description": "Required ADA deposit amount\nExamples:\n- \"1.5\" (with amount_in_decimal=true) means 1.5 ADA \n- \"1000000\" (with amount_in_decimal=false) means 1 ADA\n"
                          }
                        },
                        "required": [
                          "owner_address",
                          "protocol",
                          "token_in",
                          "token_out",
                          "amount_in",
                          "min_amount_out",
                          "created_at",
                          "tx_in",
                          "dex_fee",
                          "deposit"
                        ]
                      }
                    },
                    "amount_in_decimal": {
                      "type": "boolean",
                      "description": "Whether amount_in_decimal is enabled or not"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Protocol": {
        "type": "string",
        "enum": [
          "MinswapV2",
          "Minswap",
          "MinswapStable",
          "MuesliSwap",
          "Splash",
          "SundaeSwapV3",
          "SundaeSwap",
          "VyFinance",
          "CswapV1",
          "WingRidersV2",
          "WingRiders",
          "WingRidersStableV2",
          "Spectrum",
          "SplashStable"
        ]
      },
      "Asset": {
        "type": "object",
        "required": ["token_id"],
        "properties": {
          "token_id": {
            "type": "string",
            "description": "Token identifier, two possible formats:\n- For ADA: use \"lovelace\"\n- For other tokens: concatenate <policyId><tokenName> in hex\nExample: \"29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e\" for MIN token\n"
          },
          "logo": {
            "type": "string",
            "nullable": true,
            "description": "Logo url of the token\nCan be null if no logo is available\n"
          },
          "ticker": {
            "type": "string",
            "nullable": true,
            "description": "Token ticker symbol (if available)\nCan be null for tokens without a ticker symbol\nExample: \"MIN\", \"iUSD\", \"DJED\"\n"
          },
          "is_verified": {
            "type": "boolean",
            "nullable": true,
            "description": "Token verification status on Minswap\n- true: Token is verified by Minswap\n- false: Token is not verified\n- null: Verification status unknown\n"
          },
          "price_by_ada": {
            "type": "number",
            "nullable": true,
            "description": "Token price denominated in ADA\nCan be null if price information is unavailable\nExample: 1.5 means 1 token = 1.5 ADA\n"
          },
          "project_name": {
            "type": "string",
            "nullable": true,
            "description": "Name of the project that issued the token\nCan be null for unknown projects\nExample: \"Minswap\", \"Indigo\"\n"
          },
          "decimals": {
            "type": "number",
            "nullable": true,
            "description": "Number of decimal places for the token\n- ADA always has 6 decimals (1 ADA = 1,000,000 lovelace)\n- Most tokens follow the 6 decimal standard\n- Can be null for tokens with unknown decimals\nExample: 6 means divide by 1,000,000 to get actual amount\n"
          }
        }
      }
    }
  }
}
```

## Build transaction to cancel pending orders

> Builds an unsigned transaction that cancels pending swap orders.\
> This is useful when:\
> \- A swap transaction is stuck or pending\
> \- You want to reclaim tokens from an unfilled order\
> \- You want to cancel multiple orders at once\
> \
> Supports cancelling orders across multiple DEX protocols\
> Can cancel up to 6 orders in a single transaction\\

```json
{
  "openapi": "3.0.0",
  "info": {"title": "Minswap Aggregator API Documentation", "version": "1.0.0"},
  "servers": [
    {
      "url": "https://agg-api.minswap.org/aggregator",
      "description": "Production server"
    }
  ],
  "paths": {
    "/cancel-tx": {
      "post": {
        "summary": "Build transaction to cancel pending orders",
        "description": "Builds an unsigned transaction that cancels pending swap orders.\nThis is useful when:\n- A swap transaction is stuck or pending\n- You want to reclaim tokens from an unfilled order\n- You want to cancel multiple orders at once\n\nSupports cancelling orders across multiple DEX protocols\nCan cancel up to 6 orders in a single transaction\n",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "sender": {
                    "type": "string",
                    "description": "Cardano wallet address that:\n- Originally created the orders\n- Will receive refunded tokens\n\nMust be in bech32 format\nExample: \"addr1...\"\n"
                  },
                  "orders": {
                    "type": "array",
                    "description": "List of orders to cancel\nEach order must belong to the sender\nOrders are processed in the given order\n",
                    "minItems": 1,
                    "maxItems": 6,
                    "items": {
                      "type": "object",
                      "description": "Individual order cancellation details",
                      "properties": {
                        "tx_in": {
                          "type": "string",
                          "description": "Transaction input pointer (TxHash#Index) for the order\nFormat: \"<transaction_hash>#<output_index>\"\nExample: \"1abc...#0\"\n"
                        },
                        "protocol": {
                          "$ref": "#/components/schemas/Protocol",
                          "description": "DEX protocol where the order was placed\nMust match the protocol used to create the order\n"
                        }
                      },
                      "required": ["tx_in", "protocol"]
                    }
                  }
                },
                "required": ["sender", "orders"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successfully built unsigned cancellation transaction\nThe returned CBOR can be signed by the sender's wallet\n",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "cbor": {
                      "type": "string",
                      "description": "Unsigned transaction in CBOR format\nThis can be:\n1. Signed using the sender's wallet\n2. Submitted to /finalize-and-submit-tx with witness data\n\nExample: \"84a400...\" (hex-encoded CBOR)\n"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Protocol": {
        "type": "string",
        "enum": [
          "MinswapV2",
          "Minswap",
          "MinswapStable",
          "MuesliSwap",
          "Splash",
          "SundaeSwapV3",
          "SundaeSwap",
          "VyFinance",
          "CswapV1",
          "WingRidersV2",
          "WingRiders",
          "WingRidersStableV2",
          "Spectrum",
          "SplashStable"
        ]
      }
    }
  }
}
```
