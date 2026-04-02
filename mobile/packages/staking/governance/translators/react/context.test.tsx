import {Chain} from '@yoroi/types'

import {renderHook} from '@testing-library/react-native'
import React from 'react'

import {governanceManagerMaker} from '../../manager'
import {GovernanceProvider, useGovernance} from './context'

const mockManager = governanceManagerMaker({
  api: {
    getStakingKeyState: jest.fn(),
    getDRepById: jest.fn(),
    getActiveDreps: jest.fn(),
  },
  storage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiGet: jest.fn().mockResolvedValue([]),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    join: jest.fn(),
    removeFolder: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
  network: Chain.Network.Mainnet,
  walletId: 'test-wallet-id',
  cardano: {} as never,
})

describe('GovernanceProvider', () => {
  it('should provide manager to children', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <GovernanceProvider manager={mockManager}>{children}</GovernanceProvider>
    )

    const {result} = renderHook(() => useGovernance(), {wrapper})

    expect(result.current.manager).toBe(mockManager)
  })

  it('should throw error when useGovernance is used outside provider', () => {
    expect(() => {
      renderHook(() => useGovernance())
    }).toThrow('useGovernance must be used within a GovernanceProvider')
  })
})
