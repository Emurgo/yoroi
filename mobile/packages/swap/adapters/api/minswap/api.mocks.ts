import {Swap} from '@yoroi/types'

export const api = {
  results: {
    tokens: [
      {
        id: 'lovelace',
        name: 'Cardano',
        ticker: 'ADA',
        decimals: 6,
        logo: null,
        description: null,
        website: null,
        policyId: '',
        fingerprint: null,
        group: 'ADA',
        kind: 'ft',
        image: null,
        icon: null,
        symbol: 'ADA',
        metadatas: {},
        isPrimaryToken: true,
      },
    ],
    orders: [],
    limitOptions: {
      defaultProtocol: Swap.Protocol.Minswap_v2,
      wantedPrice: 1,
      options: [],
    },
    estimate: {
      data: [],
    },
    create: {
      txCbor: 'test-cbor',
    },
    cancel: {
      txCbor: 'test-cancel-cbor',
    },
  },
  inputs: {
    cancel: {
      order: {
        txHash: 'test-tx-hash',
        outputIndex: 0,
        aggregator: Swap.Aggregator.Minswap,
        protocol: Swap.Protocol.Minswap_v2,
      },
    },
  },
}
