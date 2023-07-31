import { describe, expect, it, vi } from "vitest";
import {
  calculateAmountsGivenInput,
  calculateAmountsGivenOutput,
  constructLimitOrder,
  constructMarketOrder,
  getOpenOrders,
  getOrderDatum,
  getSupportedTokens,
  getTokenPairPools,
} from "./dex";

describe("Yoroi DEX aggregator", () => {
  it("should be able to get the tokens supported by the DEX aggregator", async () => {
    const tokens = await getSupportedTokens();

    expect(tokens).containSubset([mockTokens[0]]);
  });

  it("should be able to get the pools for the selected token pair", async () => {
    const pools = await getTokenPairPools(ADA_TOKEN, GENS_TOKEN);

    expect(pools.length).toBeGreaterThan(0);
    expect(pools).containSubset([SUNDAE_POOL]);
  });

  it("should be able to calculate the amounts given input for a trade", () => {
    const tokenPair = calculateAmountsGivenInput(SUNDAE_POOL, {
      address: ADA_TOKEN,
      amount: "20000000",
    });

    expect(Number(tokenPair.receive.amount)).approximately(21_000_000, 500_000);
  });

  it("should be able to calculate the amounts given output for a trade", () => {
    const tokenPair = calculateAmountsGivenOutput(SUNDAE_POOL, {
      address: GENS_TOKEN,
      amount: "21000000",
    });

    expect(Number(tokenPair.send.amount)).approximately(20_000_000, 500_000);
  });

  it("should get the same result for a trade regardless of the direction", () => {
    const tokenPairInput = calculateAmountsGivenInput(SUNDAE_POOL, {
      address: ADA_TOKEN,
      amount: "20000000",
    });

    const tokenPairOutput = calculateAmountsGivenOutput(SUNDAE_POOL, {
      address: GENS_TOKEN,
      amount: "21366237",
    });

    expect(Number(tokenPairInput.send.amount)).approximately(
      Number(tokenPairOutput.send.amount),
      10
    );
    expect(Number(tokenPairInput.receive.amount)).approximately(
      Number(tokenPairOutput.receive.amount),
      10
    );
  });

  it("should be able to construct a LIMIT order for a trade given a wallet address and slippage tolerance", () => {
    const slippage = 15; // 5%
    const address = "some wallet address here";

    const order = constructLimitOrder(
      {
        address: ADA_TOKEN,
        amount: "25000000",
      },
      {
        address: GENS_TOKEN,
        amount: "50000000",
      },
      SUNDAE_POOL,
      slippage,
      address
    );

    expect(order?.protocol).toEqual("sundaeswap");
    expect(order?.walletAddress).toEqual(address);
    expect(order?.send.amount).toEqual("25000000");
    expect(Number(order?.receive.amount)).approximately(
      Number("42500000"),
      100_000
    );
  });

  it("should be able to construct a MARKET order for a trade given a wallet address and slippage tolerance", async () => {
    const pools = await getTokenPairPools(ADA_TOKEN, GENS_TOKEN);
    const address = "some wallet address here";
    const slippage = 5; // 5%

    const order = constructMarketOrder(
      {
        address: ADA_TOKEN,
        amount: "25000000",
      },
      GENS_TOKEN,
      pools,
      slippage,
      address
    );

    expect(order?.protocol).toEqual("wingriders");
    expect(order?.walletAddress).toEqual(address);
    expect(order?.send.amount).toEqual("25000000");
    expect(Number(order?.receive.amount)).approximately(
      Number("26700000"),
      100_000
    );
  });

  it("should be able to get open orders for a wallet stake key hash", async () => {
    const orders = await getOpenOrders(
      "24fd15671a17a39268b7a31e2a6703f5893f254d4568411322baeeb7"
    );
    console.log(JSON.stringify(orders, null, 2));

    expect(orders.length).toBeGreaterThan(0);
    expect(orders).containSubset([
      {
        protocol: "sundaeswap",
        depposit: "2000000",
        utxo: "6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86#0",
        send: {
          address: {
            policyId: "",
            assetName: "",
          },
          amount: "1000000",
        },
        receive: {
          address: {
            policyId:
              "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa",
            assetName: "4d494c4b",
          },
          amount: "20",
        },
      },
    ]);
  });

  it("should be able to get the datum for a constructed order", async () => {
    const pools = await getTokenPairPools(ADA_TOKEN, GENS_TOKEN);
    const address = "some wallet address here";
    const slippage = 5; // 5%

    const order = constructMarketOrder(
      {
        address: ADA_TOKEN,
        amount: "25000000",
      },
      GENS_TOKEN,
      pools,
      slippage,
      address
    );

    const orderDatum = await getOrderDatum(order!);

    expect(orderDatum.contractAddress).toEqual(mockOrder.address);
    expect(orderDatum.datumHash).toEqual(mockOrder.hash);
    expect(orderDatum.datum).toEqual(mockOrder.datum);
  });
});

vi.mock("./openswap", async () => {
  const actual = await vi.importActual("./openswap");

  return {
    ...(actual as {}),
    createOrder: async () => mockOrder,
    getOrders: async () => [mockOpenOrder],
    getPools: async () => mockPools,
    getTokens: async () => mockTokens,
  };
});

const mockOpenOrder = {
  from: {
    amount: "1000000",
    token: ".",
  },
  to: {
    amount: "20",
    token: "8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa.4d494c4b",
  },
  sender:
    "addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz",
  owner:
    "addr1qy0556dz9jssrrnhv0g3ga98uczdd465cut9jjs5a4k5qy3yl52kwxsh5wfx3darrc4xwql43ylj2n29dpq3xg46a6mska8vfz",
  ownerPubKeyHash: "1f4a69a22ca1018e7763d11474a7e604d6d754c716594a14ed6d4012",
  batcherFee: {
    amount: "2500000",
    token: ".",
  },
  deposit: "2000000",
  valueAttached: [
    {
      amount: "5500000",
      token: ".",
    },
  ],
  utxo: "6c4b4e55301d79128071f05a018cf05b7de86bc3f92d05b6668423e220152a86#0",
  provider: "sundaeswap",
  batcherAddress: "addr1wxaptpmxcxawvr3pzlhgnpmzz3ql43n2tc8mn3av5kx0yzs09tqh8",
  poolId: "14",
  swapDirection: 0,
};

const mockOrder = {
  status: "success",
  datum:
    "d8799fd8799fd8799fd8799f581c353b8bc29a15603f0b73eac44653d1bd944d92e0e0dcd5eb185164a2ffd8799fd8799fd8799f581cda22c532206a75a628778eebaf63826f9d93fbe9b4ac69a7f8e4cd78ffffffff581c353b8bc29a15603f0b73eac44653d1bd944d92e0e0dcd5eb185164a21b00000188f2408726d8799fd8799f4040ffd8799f581cdda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb480014df1047454e53ffffffd8799fd879801a0006517affff",
  hash: "4ae3fc5498e9d0f04daaf2ee739e41dc3f6f4119391e7274f0b3fa15aa2163ff",
  address: "addr1wxr2a8htmzuhj39y2gq7ftkpxv98y2g67tg8zezthgq4jkg0a4ul4",
};

const mockPools = [
  {
    provider: "muesliswap_v2",
    fee: "0.3",
    tokenA: { amount: "2778918813", token: "." },
    tokenB: {
      amount: "3046518484",
      token:
        "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb.0014df1047454e53",
    },
    price: 0.9121621377301974,
    batcherFee: { amount: "950000", token: "." },
    depositFee: { amount: "2000000", token: "." },
    deposit: 2000000,
    utxo: "b9d6cef3002de24896e5949619bf5e76ddcbd44147d1a127ee04e2b7486747df#7",
    poolId:
      "909133088303c49f3a30f1cc8ed553a73857a29779f6c6561cd8093f.34e551a0dabee7dfddcb5dcea93d22040a8b9e36348057da2987a6f1bc731935",
    timestamp: "2023-05-26 15:12:11",
    lpToken: {
      amount: "2864077440",
      token:
        "af3d70acf4bd5b3abb319a7d75c89fb3e56eafcdd46b2e9b57a2557f.34e551a0dabee7dfddcb5dcea93d22040a8b9e36348057da2987a6f1bc731935",
    },
  },
  {
    provider: "minswap",
    fee: "0.3",
    tokenA: { amount: "159431695049", token: "." },
    tokenB: {
      amount: "179285403975",
      token:
        "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb.0014df1047454e53",
    },
    price: 0.8892619896220417,
    batcherFee: { amount: "2000000", token: "." },
    depositFee: { amount: "2000000", token: "." },
    deposit: 2000000,
    utxo: "a9c6386fcca2cc9ad86e86940566b3f1b22ac3e47f59fa040d42c62811184e82#3",
    poolId:
      "0be55d262b29f564998ff81efe21bdc0022621c12f15af08d0f2ddb1.4705d99a4cf6bce9181e60fdbbf961edf6acad7141ed69186c8a8883600e59c5",
    timestamp: "2023-05-26 15:12:11",
    lpToken: {
      amount: "169067370752",
      token:
        "e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86.4705d99a4cf6bce9181e60fdbbf961edf6acad7141ed69186c8a8883600e59c5",
    },
  },
  {
    provider: "sundaeswap",
    fee: "0.05",
    tokenA: { amount: "1762028491", token: "." },
    tokenB: {
      amount: "1904703890",
      token:
        "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb.0014df1047454e53",
    },
    price: 0.925093134030403,
    batcherFee: { amount: "2500000", token: "." },
    depositFee: { amount: "2000000", token: "." },
    deposit: 2000000,
    utxo: "b28ccb32adf80618a4e78d97012754f8c402b29907f1d2e6ed5df973003844f4#0",
    poolId: "0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.7020e403",
    timestamp: "2023-05-26 15:12:11",
    lpToken: {
      amount: "1813689472",
      token:
        "0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.6c7020e403",
    },
  },
  {
    provider: "wingriders",
    fee: "0.35",
    tokenA: { amount: "25476044027", token: "." },
    tokenB: {
      amount: "28844597339",
      token:
        "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb.0014df1047454e53",
    },
    price: 0.8832171837099813,
    batcherFee: { amount: "2000000", token: "." },
    depositFee: { amount: "2000000", token: "." },
    deposit: 2000000,
    utxo: "2120d4a9ece0add45461d5d3262f3708bd6cbdd8a473c7ceb32eb5e83f4c633e#0",
    poolId:
      "026a18d04a0c642759bb3d83b12e3344894e5c1c7b2aeb1a2113a570.84eaa43491009c3a9f4e257370352e84ea7246ee8a27d9d3d9e458141d9bcf97",
    timestamp: "2023-05-26 15:10:51",
    lpToken: null,
  },
];

const mockTokens = [
  {
    info: {
      supply: { total: "10000", circulating: null },
      status: "verified",
      address: {
        policyId: "53fb41609e208f1cd3cae467c0b9abfc69f1a552bf9a90d51665a4d6",
        name: "f9c09e1913e29072938cad1fda7b70939090c0be1f7fa48150a2e63a2b9ad715",
      },
      symbol: "OBOND [VICIS]",
      website: "https://app.optim.finance/dashboard",
      description:
        "A lender bond issued by Optim Finance corresponding to 100 ADA_TOKEN lent. Lending APY 5.33%. Max Duration 72 Epochs. Interest Buffer 6 epochs. Verify on token homepage to assess more details.",
      decimalPlaces: 0,
      categories: ["2"],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 1000.0,
      askPrice: 0,
      bidPrice: 1000.0,
      priceChange: { "24h": 0, "7d": 0 },
      fromToken: ".",
      toToken:
        "53fb41609e208f1cd3cae467c0b9abfc69f1a552bf9a90d51665a4d6.f9c09e1913e29072938cad1fda7b70939090c0be1f7fa48150a2e63a2b9ad715",
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "53fb41609e208f1cd3cae467c0b9abfc69f1a552bf9a90d51665a4d6",
        name: "f9c09e1913e29072938cad1fda7b70939090c0be1f7fa48150a2e63a2b9ad715",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
  {
    info: {
      supply: { total: "100000000000", circulating: null },
      status: "unverified",
      website: "https://cardanofight.club",
      symbol: "CFC",
      decimalPlaces: 0,
      image:
        "https://tokens.muesliswap.com/static/img/tokens/71ccb467ef856b242753ca53ade36cd1f8d9abb33fdfa7d1ff89cda3.434643.png",
      description:
        "The official token for Cardano Fight Club. The ultimate utility token for all CFC Products and Development.",
      address: {
        policyId: "71ccb467ef856b242753ca53ade36cd1f8d9abb33fdfa7d1ff89cda3",
        name: "434643",
      },
      categories: [],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 14.5211676983,
      askPrice: 0,
      bidPrice: 1.112,
      priceChange: { "24h": 0, "7d": 0 },
      fromToken: ".",
      toToken:
        "71ccb467ef856b242753ca53ade36cd1f8d9abb33fdfa7d1ff89cda3.434643",
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "71ccb467ef856b242753ca53ade36cd1f8d9abb33fdfa7d1ff89cda3",
        name: "434643",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
  {
    info: {
      supply: { total: "10000000", circulating: null },
      status: "unverified",
      website: "https://www.cardanofly.io/",
      symbol: "cdfly",
      decimalPlaces: 0,
      image: "ipfs://QmQaKcTjrBSVbmK5xZgaWjEa5yKzUSLRAbVyhyzbceXSMH",
      description: "",
      address: {
        policyId: "5d5aadeebb07a5e48827ef6efe577c7b4db4a69b2db1b29279e0b514",
        name: "6364666c79",
      },
      imageIpfsHash: "QmQaKcTjrBSVbmK5xZgaWjEa5yKzUSLRAbVyhyzbceXSMH",
      minting: {
        type: "time-lock-policy",
        blockchain: "cardano",
        mintedBeforeSlotNumber: 74916255,
      },
      mediatype: "image/png",
      tokentype: "token",
      totalsupply: 10000000,
      categories: [],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: { "24h": 0, "7d": 0 },
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "5d5aadeebb07a5e48827ef6efe577c7b4db4a69b2db1b29279e0b514",
        name: "6364666c79",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
  {
    info: {
      supply: { total: "100000000000000", circulating: null },
      status: "unverified",
      website: "https://linktr.ee/nutriemp.CRYPTO",
      symbol: "BUDZ",
      decimalPlaces: 2,
      image: "ipfs://QmSESYYcMk9i3EDbQSWBmkfEWK4X7TokohJyvQThxpANgq",
      description: "NUTRIEMP.CRYPTO - GROWERS UNITE",
      address: {
        policyId: "d2cb1f7a8ae3bb94117e30d241566c2dd5adbd0708c40a8a5ac9ae60",
        name: "4255445a",
      },
      imageIpfsHash: "QmSESYYcMk9i3EDbQSWBmkfEWK4X7TokohJyvQThxpANgq",
      minting: {
        type: "time-lock-policy",
        blockchain: "cardano",
        mintedBeforeSlotNumber: 78641478,
      },
      mediatype: "image/png",
      tokentype: "token",
      totalsupply: 100000000000000,
      categories: [],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: { "24h": 0, "7d": 0 },
      quoteDecimalPlaces: 2,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "d2cb1f7a8ae3bb94117e30d241566c2dd5adbd0708c40a8a5ac9ae60",
        name: "4255445a",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
  {
    info: {
      supply: { total: "10000000", circulating: null },
      status: "unverified",
      website: "https://ratsonchain.com",
      description: "The official token of Rats On Chain",
      image: "ipfs://QmeJPgcLWDDTBKxqTzWdDj1ruE5huBf3cbJNPVetnqW7DH",
      symbol: "ROC",
      decimalPlaces: 0,
      address: {
        policyId: "91ec8c9ae38d203c0fa1e0a31274f05bee7be4eb0133ed0beb837297",
        name: "524f43",
      },
      imageIpfsHash: "QmeJPgcLWDDTBKxqTzWdDj1ruE5huBf3cbJNPVetnqW7DH",
      ticker: "ROC",
      project: "Rats On Chain",
      mediatype: "image/png",
      categories: [],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: { "24h": 0, "7d": 0 },
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "91ec8c9ae38d203c0fa1e0a31274f05bee7be4eb0133ed0beb837297",
        name: "524f43",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
  {
    info: {
      supply: { total: "39997832", circulating: null },
      status: "unverified",
      symbol: "BURPZ",
      decimalPlaces: 0,
      image: "ipfs://QmZcnb7DSFXdd9crvTMyTXnbQvUU5srktxK8aZxUNFvZDJ",
      description: "Official Fluffy Utility Token",
      address: {
        policyId: "ef71f8d84c69bb45f60e00b1f595545238b339f00b137dd5643794bb",
        name: "425552505a",
      },
      imageIpfsHash: "QmZcnb7DSFXdd9crvTMyTXnbQvUU5srktxK8aZxUNFvZDJ",
      ticker: "BURPZ",
      twitter: "@FluffysNFT",
      mediatype: "image/png",
      categories: [],
    },
    price: {
      volume: { base: "0", quote: "0" },
      volumeChange: { base: 0, quote: 0 },
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: { "24h": "0", "7d": "0" },
      fromToken: "lovelace",
      toToken:
        "ef71f8d84c69bb45f60e00b1f595545238b339f00b137dd5643794bb.425552505a",
      price10d: [],
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "ef71f8d84c69bb45f60e00b1f595545238b339f00b137dd5643794bb",
        name: "425552505a",
      },
      baseAddress: { policyId: "", name: "" },
    },
  },
  {
    info: {
      supply: { total: "76222812878", circulating: null },
      status: "unverified",
      address: {
        policyId: "e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86",
        name: "f86a805f257a14b127b9b54444e556ab1a066f690501d4474bbad4454324845b",
      },
      decimalPlaces: 0,
      symbol:
        "f86a805f257a14b127b9b54444e556ab1a066f690501d4474bbad4454324845b",
      categories: [],
    },
    price: {
      volume: { base: 0, quote: 0 },
      volumeChange: { base: 0, quote: 0 },
      price: 0,
      askPrice: 0,
      bidPrice: 0,
      priceChange: { "24h": 0, "7d": 0 },
      quoteDecimalPlaces: 0,
      baseDecimalPlaces: 6,
      quoteAddress: {
        policyId: "e4214b7cce62ac6fbba385d164df48e157eae5863521b4b67ca71d86",
        name: "f86a805f257a14b127b9b54444e556ab1a066f690501d4474bbad4454324845b",
      },
      baseAddress: { policyId: "", name: "" },
      price10d: [],
    },
  },
];

const ADA_TOKEN = {
  policyId: "",
  assetName: "",
};

const GENS_TOKEN = {
  policyId: "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb",
  assetName: "0014df1047454e53",
};

const SUNDAE_POOL = {
  protocol: "sundaeswap" as const,
  batcherFee: "2500000",
  lvlDeposit: "2000000",
  tokenA: {
    address: {
      policyId: "",
      assetName: "",
    },
    amount: "1762028491",
  },
  tokenB: {
    address: {
      policyId: "dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb",
      assetName: "0014df1047454e53",
    },
    amount: "1904703890",
  },
  poolFee: "0.05",
  poolId: "0029cb7c88c7567b63d1a512c0ed626aa169688ec980730c0473b913.7020e403",
};
