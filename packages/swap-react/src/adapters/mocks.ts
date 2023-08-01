import {Swap} from '@yoroi/types'

export function makeMockSwapStorage(): Readonly<Swap.Storage> {
  const slippage: Swap.Storage['slippage'] = {
    read: () => {
      console.debug('[swap-react] makeMockSwapStorage slippage read')
      return Promise.resolve(0.1)
    },
    remove: () => {
      console.debug('[swap-react] makeMockSwapStorage slippage remove')
      return Promise.resolve()
    },
    save: (newSlippage) => {
      console.debug(
        '[swap-react] makeMockSwapStorage slippage save',
        newSlippage,
      )
      return Promise.resolve()
    },
  }

  const reset: Swap.Storage['reset'] = () => {
    console.debug('[swap-react] makeMockSwapStorage reset')
    return Promise.all([slippage.remove()])
  }

  return {
    slippage,
    reset,
  } as const
}

export class MockSwapApi implements Swap.Api {
  async createOrder(
    order: Swap.CreateOrderData,
  ): Promise<Swap.CreateOrderResponse> {
    console.debug('[swap-react] MockSwapApi.createOrder', order)
    return {
      datum: '',
      datumHash: '',
      contractAddress: '',
    }
  }

  async cancelOrder(
    orderUTxO: string,
    collateralUTxO: string,
    walletAddress: string,
  ): Promise<string> {
    console.debug(
      '[swap-react] MockSwapApi.cancelOrder',
      orderUTxO,
      collateralUTxO,
      walletAddress,
    )

    return ''
  }

  async getOrders(stakeKeyHash: string): Promise<Swap.OpenOrder[]> {
    console.debug('[swap-react] MockSwapApi.getOrders', stakeKeyHash)
    return []
  }

  async getTokens(
    policyId?: string | undefined,
    assetName?: string | undefined,
  ): Promise<Swap.TokenInfo[]> {
    console.debug('[swap-react] MockSwapApi.getTokens', policyId, assetName)
    return []
  }

  async getPools(
    tokenA: Swap.BaseTokenInfo,
    tokenB: Swap.BaseTokenInfo,
  ): Promise<Swap.Pool[]> {
    console.debug('[swap-react] MockSwapApi.getPools', tokenA, tokenB)
    return []
  }
}

export const swapApiBaseUrls = {
  mainnet: 'https://onchain2.muesliswap.com/',
  testnet: 'https://onchain2.muesliswap.com/',
} as const
