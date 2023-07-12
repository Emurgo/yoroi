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
    return Promise.all([slippage.remove])
  }

  return {
    slippage,
    reset,
  } as const
}

export function makeMockSwapApiClient(options: Swap.FactoryOptions) {
  console.debug('[swap-react] makeMockSwapApiClient', options)
  return {
    getOpenOrders: (stakeKeyHash: string) => {
      console.debug(
        '[swap-react] makeMockSwapApiClient getOpenOrders',
        stakeKeyHash,
      )
      return Promise.resolve([])
    },
    getCancelOrderTx: (
      orderUTxO: string,
      collateralUTxOs: string,
      walletAddress: string,
    ) => {
      console.debug(
        '[swap-react] makeMockSwapApiClient getCancelOrderTx',
        orderUTxO,
        collateralUTxOs,
        walletAddress,
      )
      return Promise.resolve({})
    },
    getOrderDatum: (order: any) => {
      console.debug('[swap-react] makeMockSwapApiClient getOrderDatum', order)
      return Promise.resolve({})
    },
    getSupportedTokens: (baseToken: string) => {
      console.debug(
        '[swap-react] makeMockSwapApiClient getSupportedTokens',
        baseToken,
      )
      return Promise.resolve([])
    },
    getTokenPairPools: (sendToken: string, receiveToken: string) => {
      console.debug(
        '[swap-react] makeMockSwapApiClient getTokenPairPools',
        sendToken,
        receiveToken,
      )
      return Promise.resolve([])
    },
  } as const
}

export const swapApiBaseUrls = {
  mainnet: 'https://onchain2.muesliswap.com/',
  testnet: 'https://onchain2.muesliswap.com/',
} as const
