fetch(
  'https://api.muesliswap.com/orders/aggregator?wallet=0101211a2b01ed1e0e778f49537a9b3dfea114c39c8db0b4b5ccb266bb5ae0fcf9c97aa76a74fbdfe84413f8e49df87ec0f62cb6b370f2dae4',
  {
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'sec-ch-ua': '"Not(A:Brand";v="24", "Chromium";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
    referrer: 'https://muesliswap.com/',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: null,
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
  },
)

const response = [
  {
    fromToken: {
      address: {
        policyId: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880',
        name: '69555344',
      },
      symbol: 'iUSD',
      image:
        'https://tokens.muesliswap.com/static/img/tokens/f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880.69555344_scaled_100.webp',
      decimalPlaces: 6,
    },
    toToken: {
      address: {policyId: '', name: ''},
      symbol: 'ADA',
      image: 'https://static.muesliswap.com/images/tokens/ada.png',
      decimalPlaces: 6,
    },
    batchToken: {
      address: {policyId: '', name: ''},
      symbol: 'ADA',
      decimalPlaces: 6,
    },
    batcherFee: '2000000',
    fromAmount: '1000000',
    toAmount: '990000000',
    attachedValues: [
      {
        address: {
          policyId: 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880',
          name: '69555344',
        },
        amount: '1000000',
      },
      {address: {policyId: '', name: ''}, amount: '4000000'},
    ],
    owner:
      'addr1qyqjzx3tq8k3urnh3ay4x75m8hl2z9xrnjxmpd94ejexdw66ur70njt65a48f77lapzp878ynhu8as8k9jmtxu8jmtjq69hnqg',
    sender:
      'addr1qyqjzx3tq8k3urnh3ay4x75m8hl2z9xrnjxmpd94ejexdw66ur70njt65a48f77lapzp878ynhu8as8k9jmtxu8jmtjq69hnqg',
    providerSpecifics: null,
    txHash: '55fa30c4561e5665218a2dcf56dc5187f1a94ebb29f1ec1e119bc0c4ef36f732',
    outputIdx: 0,
    status: 'open',
    provider: 'minswapv2',
    placedAt: null,
    finalizedAt: null,
    batcherAddress:
      'addr1wxn9efv2f6w82hagxqtn62ju4m293tqvw0uhmdl64ch8uwc0h43gt',
  },
]
