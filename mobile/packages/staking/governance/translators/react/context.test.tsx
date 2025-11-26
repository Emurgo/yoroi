import {renderHook} from '@testing-library/react-native'

import {governanceManagerMaker} from '../../manager'
import {GovernanceProvider, useGovernance} from './context'

const mockManager = governanceManagerMaker({
  api: {
    getStakeKeyState: jest.fn(),
    getDRepById: jest.fn(),
  },
  storage: {
    read: jest.fn().mockResolvedValue({}),
    save: jest.fn(),
    remove: jest.fn(),
    subscribe: jest.fn(),
  },
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
