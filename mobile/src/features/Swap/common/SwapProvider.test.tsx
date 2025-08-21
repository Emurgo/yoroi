import {render} from '@testing-library/react-native'
import * as React from 'react'

import {SwapContext, SwapProvider} from './SwapProvider'

// Mock the dependencies
jest.mock('~/features/Portfolio/common/hooks/usePortfolioTokenInfos', () => ({
  usePortfolioTokenInfos: () => ({
    tokenInfos: undefined, // Simulate the problematic case
  }),
}))

jest.mock('~/features/WalletManager/hooks/useSelectedWallet', () => ({
  useSelectedWallet: () => ({
    wallet: {
      networkManager: {network: 'mainnet'},
      externalAddresses: ['addr1'],
      portfolioPrimaryTokenInfo: {
        id: 'primary',
        name: 'ADA',
        ticker: 'ADA',
        decimals: 6,
      },
    },
  }),
}))

jest.mock('~/features/Portfolio/common/hooks/usePortfolioBalances', () => ({
  usePortfolioBalances: () => ({
    records: new Map(),
  }),
}))

jest.mock('~/features/Staking/hooks/useStakingKey', () => ({
  useStakingKey: () => 'staking-key',
}))

jest.mock('~/features/Swap/common/useSwapConfig', () => ({
  useSwapConfig: () => ({
    partners: [],
    excludedTokens: [],
  }),
}))

jest.mock('~/features/Swap/common/useGetInputs', () => ({
  useGetInputs: () => ({
    getInputs: jest.fn(),
  }),
}))

jest.mock('~/features/Swap/common/navigation', () => ({
  useNavigateTo: () => ({
    reviewSwap: jest.fn(),
  }),
}))

jest.mock('~/kernel/i18n/useStrings', () => ({
  useStrings: () => ({
    swap: {
      notEnoughBalance: 'Not enough balance',
    },
  }),
}))

jest.mock('~/kernel/metrics/metricsManager', () => ({
  useMetrics: () => ({
    track: {
      swapOrderSelected: jest.fn(),
    },
  }),
}))

jest.mock('@yoroi/swap', () => ({
  swapManagerMaker: () => ({
    api: {
      orders: jest.fn().mockResolvedValue({tag: 'right', value: {data: []}}),
      tokens: jest.fn().mockResolvedValue({tag: 'right', value: {data: []}}),
      limitOptions: jest.fn(),
      estimate: jest.fn(),
      create: jest.fn(),
      cancel: jest.fn(),
    },
    settings: {
      routingPreference: 'auto',
      slippage: 1,
    },
    assignSettings: jest.fn(),
  }),
  swapStorageMaker: () => ({}),
}))

describe('SwapProvider', () => {
  it('should provide tokenInfos as a Map even when usePortfolioTokenInfos returns undefined', () => {
    const TestComponent = () => {
      const {tokenInfos} = React.useContext<SwapContext>(
        require('./SwapProvider').SwapContextInstance,
      )

      // This should not throw an error
      tokenInfos.get('test-token.test-token')

      return null
    }

    expect(() => {
      render(
        <SwapProvider>
          <TestComponent />
        </SwapProvider>,
      )
    }).not.toThrow()
  })
})
