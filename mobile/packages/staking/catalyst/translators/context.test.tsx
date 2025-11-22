import {act, renderHook} from '@testing-library/react-native'

import {catalystApiMaker} from '../api-maker'
import {catalystManagerMaker} from '../manager'
import {CatalystProvider, useCatalyst} from './context'

const mockRequest = jest.fn()
const mockApi = catalystApiMaker({
  request: mockRequest,
})

const mockManager = catalystManagerMaker({api: mockApi})

describe('CatalystProvider', () => {
  it('should provide manager and state to children', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <CatalystProvider manager={mockManager}>{children}</CatalystProvider>
    )

    const {result} = renderHook(() => useCatalyst(), {wrapper})

    expect(result.current).toHaveProperty('config')
    expect(result.current).toHaveProperty('getFundInfo')
    expect(result.current).toHaveProperty('fundStatus')
    expect(result.current).toHaveProperty('pin')
    expect(result.current).toHaveProperty('votingKeyEncrypted')
  })

  it('should work without provider (has default context)', async () => {
    // The context has a default value, so it doesn't throw
    const {result} = renderHook(() => useCatalyst())

    // The default manager has uninitialized methods that reject
    await expect(result.current.getFundInfo()).rejects.toThrow(
      'Catalyst manager not yet initialized',
    )
  })

  it('should accept initial state', () => {
    const initialState = {
      pin: '1234',
      votingKeyEncrypted: 'encrypted-key',
    }
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <CatalystProvider manager={mockManager} initialState={initialState}>
        {children}
      </CatalystProvider>
    )

    const {result} = renderHook(() => useCatalyst(), {wrapper})

    expect(result.current.pin).toBe('1234')
    expect(result.current.votingKeyEncrypted).toBe('encrypted-key')
  })

  it('should provide actions', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <CatalystProvider manager={mockManager}>{children}</CatalystProvider>
    )

    const {result} = renderHook(() => useCatalyst(), {wrapper})

    expect(result.current.pinChanged).toBeDefined()
    expect(result.current.votingKeyEncryptedChanged).toBeDefined()
    expect(result.current.reset).toBeDefined()
  })

  it('should update state when actions are called', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <CatalystProvider manager={mockManager}>{children}</CatalystProvider>
    )

    const {result} = renderHook(() => useCatalyst(), {wrapper})

    act(() => {
      result.current.pinChanged('5678')
    })

    // State should be updated
    expect(result.current.pin).toBe('5678')
  })
})
