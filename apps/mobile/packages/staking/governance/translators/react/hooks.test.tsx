import {useMutationWithInvalidations} from '@yoroi/common'

import {init} from '@emurgo/cross-csl-nodejs'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {renderHook, waitFor} from '@testing-library/react-native'
import * as React from 'react'

import {GovernanceManager} from '../../manager'
import {managerMock} from '../../mocks'
import {GovernanceProvider} from './context'
import {
  useDelegationCertificate,
  useIsValidDRepID,
  useLatestGovernanceAction,
  useUpdateLatestGovernanceAction,
  useVotingCertificate,
} from './hooks'

jest.mock('@yoroi/common', () => ({
  ...jest.requireActual('@yoroi/common'),
  useMutationWithInvalidations: jest.fn(),
}))

const createMocks = (managerPatch: Partial<GovernanceManager>) => {
  const manager = {...managerMock, ...managerPatch}
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {staleTime: 0, retry: false},
      mutations: {retry: false},
    },
  })
  const wrapper = ({children}: React.PropsWithChildren) => {
    return (
      <QueryClientProvider client={queryClient}>
        <GovernanceProvider manager={manager}>{children}</GovernanceProvider>
      </QueryClientProvider>
    )
  }
  return {wrapper, manager, queryClient}
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
    const mockMutation = {
      mutate: jest.fn(),
      isSuccess: false,
      isPending: false,
    }
    ;(useMutationWithInvalidations as jest.Mock).mockReturnValue(mockMutation)

    const {wrapper, manager} = createMocks({
      setLatestGovernanceAction: jest.fn().mockResolvedValue(true),
    })
    renderHook(() => useUpdateLatestGovernanceAction('wallet-id'), {
      wrapper,
    })

    expect(useMutationWithInvalidations).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      invalidateQueries: [
        ['wallet-id', managerMock.network, 'useLatestGovernanceAction'],
      ],
    })

    // Test the mutation function
    const mutationFn = (useMutationWithInvalidations as jest.Mock).mock
      .calls[0][0].mutationFn
    await mutationFn({
      hash: 'drepId',
      type: 'key',
      kind: 'delegate-to-drep',
      txID: 'txId',
    })

    expect(manager.setLatestGovernanceAction).toHaveBeenCalledWith({
      hash: 'drepId',
      type: 'key',
      kind: 'delegate-to-drep',
      txID: 'txId',
    })
  })

  it('useDelegationCertificate should call manager.createDelegationCertificate', () => {
    const {wrapper, manager} = createMocks({
      createDelegationCertificate: jest.fn().mockReturnValue({}),
    })

    const cardano = init('global')
    const privateKey = cardano.Bip32PrivateKey.fromBytes(
      Buffer.from(privateKeyCBOR, 'hex'),
    )
    const publicKey = privateKey.toPublic()
    const stakingKey = publicKey.derive(2).derive(0).toRawKey()
    const {result} = renderHook(() => useDelegationCertificate(), {wrapper})

    const certificate = result.current({
      hash: 'drepId',
      type: 'key',
      stakingKey,
    })

    expect(manager.createDelegationCertificate).toHaveBeenCalledWith(
      'drepId',
      'key',
      stakingKey,
    )
    expect(certificate).toBeDefined()
  })

  it('useVotingCertificate should call manager.createVotingCertificate', async () => {
    const {wrapper, manager} = createMocks({
      createVotingCertificate: jest.fn().mockResolvedValue(true),
    })

    const cardano = init('global')
    const privateKey = cardano.Bip32PrivateKey.fromBytes(
      Buffer.from(privateKeyCBOR, 'hex'),
    )
    const publicKey = privateKey.toPublic()
    const stakingKey = publicKey.derive(2).derive(0).toRawKey()
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
