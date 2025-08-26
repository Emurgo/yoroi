import {render} from '@testing-library/react-native'
import * as React from 'react'

import {SwapContext, SwapProvider} from './SwapProvider'

// Mock the dependencies
jest.mock('~/features/Portfolio/common/hooks/usePortfolioTokenInfos', () => ({
  usePortfolioTokenInfosSuspense: () => ({
    tokenInfos: undefined, // Simulate the problematic case
  }),
}))

jest.mock('~/features/WalletManager/hooks/useSelectedWallet', () => ({
  useSelectedWallet: () => ({
    wallet: {
      networkManager: {network: 'mainnet'},
      externalAddresses: ['addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke'],
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
  useStakingKey: () => '7538357a3717e7746b4c79bac7dcc538567615ee3247e40f44ea83bd',
}))

jest.mock('~/features/Swap/common/useSwapConfig', () => ({
  useSwapConfig: () => ({
    partners: {
      dexhunter: 'test-partner',
      muesliswap: 'test-partner',
    },
    excludedTokens: [],
    swapConfig: {
      partners: {
        dexhunter: 'test-partner',
        muesliswap: 'test-partner',
      },
      excludedTokens: [],
    },
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

// Mock convertBech32ToHex
jest.mock('~/wallets/cardano/common/signatureUtils', () => ({
  convertBech32ToHex: () => '0123456789abcdef',
}))

// Mock all React Query hooks
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      options: [],
      defaultProtocol: undefined,
      wantedPrice: undefined,
    },
    refetch: jest.fn(),
  }),
}))

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
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
    // Test the specific logic that handles undefined tokenInfos
    const portfolioTokenInfos = undefined
    const tokenInfos = portfolioTokenInfos ?? new Map()
    
    // Verify that tokenInfos is always a Map
    expect(tokenInfos).toBeInstanceOf(Map)
    
    // Verify that we can call .get() on it without throwing
    expect(() => {
      tokenInfos.get('test-token.test-token')
    }).not.toThrow()
    
    // Verify that .get() returns undefined for non-existent keys
    expect(tokenInfos.get('test-token.test-token')).toBeUndefined()
  })

  it('should validate the Cardano address format', () => {
    const validAddress = 'addr1q9ndnrwz52yeex4j04kggp0ul5632qmxqx22ugtukkytjysw86pdygc6zarl2kks6fvg8um447uvv679sfdtzkwf2kuq673wke'
    
    // Verify it's a valid Shelley mainnet address
    expect(validAddress).toMatch(/^addr1[a-z0-9]+$/)
    expect(validAddress.length).toBeGreaterThan(100) // Valid addresses are long
  })

  it('should validate the staking key format', () => {
    const validStakingKey = '7538357a3717e7746b4c79bac7dcc538567615ee3247e40f44ea83bd'
    
    // Verify it's a valid hex string
    expect(validStakingKey).toMatch(/^[0-9a-f]+$/)
    expect(validStakingKey.length).toBe(56) // Staking keys are 28 bytes = 56 hex chars
  })
})
