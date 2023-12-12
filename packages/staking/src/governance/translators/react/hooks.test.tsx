import {afterEach, describe} from '@jest/globals'
import React, {PropsWithChildren} from 'react'
import {
  useDelegationCertificate,
  useIsValidDRepID,
  useLatestGovernanceAction,
  useUpdateLatestGovernanceAction,
  useVotingCertificate,
} from './hooks'
import {GovernanceProvider} from './context'
import {managerMock} from '../../mocks'
import {act, renderHook, waitFor} from '@testing-library/react-native'
import {QueryClient, QueryClientProvider} from 'react-query'
import {GovernanceManager} from '../../manager'
import {init} from '@emurgo/cross-csl-nodejs'

const createMocks = (managerPatch: Partial<GovernanceManager>) => {
  const manager = {...managerMock, ...managerPatch}
  const queryClient = new QueryClient()
  queryClient.setDefaultOptions({queries: {cacheTime: 0, retry: false}})
  const wrapper = ({children}: PropsWithChildren<{}>) => {
    return (
      <QueryClientProvider client={queryClient}>
        <GovernanceProvider manager={manager}>{children}</GovernanceProvider>
      </QueryClientProvider>
    )
  }
  return {wrapper, manager}
}

describe('Governance Translators React', () => {
  afterEach((done) => {
    jest.clearAllMocks()
    done()
  })

  it('should crash when not called inside GovernanceProvider', () => {
    expect(() => renderHook(() => useIsValidDRepID('drepId'))).toThrow(
      /GovernanceProvider/,
    )
  })

  it('useIsValidDRepID should call manager.validateDRepID', async () => {
    const {wrapper, manager} = createMocks({
      validateDRepID: jest.fn().mockResolvedValue(true),
    })
    const {result} = renderHook(() => useIsValidDRepID('drepId'), {wrapper})
    await waitFor(() => result.current.isSuccess)
    expect(manager.validateDRepID).toHaveBeenCalledWith('drepId')
  })

  it('useLatestGovernanceAction should call manager.getLatestGovernanceAction', async () => {
    const {wrapper, manager} = createMocks({
      getLatestGovernanceAction: jest.fn().mockResolvedValue(true),
    })
    const {result} = renderHook(() => useLatestGovernanceAction('wallet-id'), {
      wrapper,
    })
    await waitFor(() => result.current.isSuccess)
    expect(manager.getLatestGovernanceAction).toHaveBeenCalled()
  })

  it('useUpdateLatestGovernanceAction should call manager.setLatestGovernanceAction', async () => {
    const {wrapper, manager} = createMocks({
      setLatestGovernanceAction: jest.fn().mockResolvedValue(true),
    })
    const {result} = renderHook(
      () => useUpdateLatestGovernanceAction('wallet-id'),
      {
        wrapper,
      },
    )
    act(() => {
      result.current.mutate({
        drepID: 'drepId',
        kind: 'delegate-to-drep',
        txID: 'txId',
      })
    })
    await waitFor(() => result.current.isSuccess)
    expect(manager.setLatestGovernanceAction).toHaveBeenCalledWith({
      drepID: 'drepId',
      kind: 'delegate-to-drep',
      txID: 'txId',
    })
  })

  it('useDelegationCertificate should call manager.createDelegationCertificate', async () => {
    const {wrapper, manager} = createMocks({
      createDelegationCertificate: jest.fn().mockResolvedValue(true),
    })

    const cardano = init('global')
    const privateKey = await cardano.Bip32PrivateKey.fromBytes(
      Buffer.from(privateKeyCBOR, 'hex'),
    )
    const publicKey = await privateKey.toPublic()
    const stakingKey = await publicKey
      .derive(2)
      .then((x) => x.derive(0))
      .then((x) => x.toRawKey())
    const {result} = renderHook(() => useDelegationCertificate(), {wrapper})
    await waitFor(() =>
      result.current.createCertificate({drepID: 'drepId', stakingKey}),
    )
    await waitFor(() => result.current.isSuccess)
    expect(manager.createDelegationCertificate).toHaveBeenCalledWith(
      'drepId',
      stakingKey,
    )
  })

  it('useVotingCertificate should call manager.createVotingCertificate', async () => {
    const {wrapper, manager} = createMocks({
      createVotingCertificate: jest.fn().mockResolvedValue(true),
    })

    const cardano = init('global')
    const privateKey = await cardano.Bip32PrivateKey.fromBytes(
      Buffer.from(privateKeyCBOR, 'hex'),
    )
    const publicKey = await privateKey.toPublic()
    const stakingKey = await publicKey
      .derive(2)
      .then((x) => x.derive(0))
      .then((x) => x.toRawKey())
    const {result} = renderHook(() => useVotingCertificate(), {wrapper})
    await waitFor(() =>
      result.current.createCertificate({vote: 'no-confidence', stakingKey}),
    )
    await waitFor(() => result.current.isSuccess)
    expect(manager.createVotingCertificate).toHaveBeenCalledWith(
      'no-confidence',
      stakingKey,
    )
  })
})

const privateKeyCBOR =
  '780de6f67db8e048fe17df60d1fff06dd700cc54b10fc4bcf30f59444d46204c0b890d7dce4c8142d4a4e8e26beac26d6f3c191a80d7b79cc5952968ad7ffbb7d43e76aa8d9b5ad9d91d48479ecd8ef6d00e8df8874e8658ece0cdef94c42367'
