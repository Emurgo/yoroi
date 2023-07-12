import {BalanceAmount, BalanceToken} from '../balance/token'

export type SwapOrderType = 'market' | 'limit'

export type SwapSlippageOptions =
  | '0'
  | '0.1'
  | '0.5'
  | '1'
  | '2'
  | '3'
  | 'Manual'

export type SwapProtocol =
  | 'minswap'
  | 'sundaeswap'
  | 'wingriders'
  | 'muesliswap'

export type SwapFactoryOptions = {
  apiUrl: string
  stakingKey: string
}

export type SwapOrderCreateData = {
  amounts: {
    sell: BalanceAmount
    buy: BalanceAmount
  }
  address: string
  slippage: number
} & (
  | {
      protocol: Omit<SwapProtocol, 'sundaeswap'>
      poolId: string | undefined // only required for SundaeSwap trades.
    }
  | {
      protocol: 'sundaeswap'
      poolId: string
    }
)

export type SwapOrder = Omit<SwapOrderCreateData, 'address'> & {
  deposit: string
  utxo: string
  // check wallet address
  // check fields
  createdAt: Date
  txHash: string
}

export type SwapOrderCancelData = {
  utxos: {
    order: string
    collaterals: Array<string>
  }
  address: string
}

export type SwapOrderDatum = {
  contractAddress: string
  datumHash: string
  datum: string
}

export type SwapPool = {
  protocol: SwapProtocol
  id: string | undefined
  minDeposit: string
  fees: {
    batcher: string
    pool: string
  }
  tokens: {
    a: BalanceToken
    b: BalanceToken
    lp: BalanceToken
  }
  price: number
  lastUpdate: Date
}

export type SwapModule = {
  orders: {
    prepare: (order: SwapOrderCreateData) => Promise<SwapOrderDatum>
    create: (order: SwapOrderCreateData) => Promise<SwapOrderDatum>
    cancel: (order: SwapOrderCancelData) => Promise<string>
    list: {
      byStatusOpen: () => Promise<Array<SwapOrder>>
    }
  }
  pairs: {
    list: {
      byToken: (
        baseTokenId: BalanceToken['info']['id'],
      ) => Promise<Array<BalanceToken>>
    }
  }
  pools: {
    list: {
      byPair: ({
        from,
        to,
      }: {
        from: BalanceToken['info']['id']
        to: BalanceToken['info']['id']
      }) => Promise<Array<SwapPool>>
    }
  }
}
