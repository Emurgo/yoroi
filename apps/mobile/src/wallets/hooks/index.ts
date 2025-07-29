import {walletChecksum} from '@emurgo/cip4-js'
import {Certificate} from '@emurgo/cross-csl-core'
import {FullPoolInfo, PoolInfoApi} from '@emurgo/yoroi-lib'
import AsyncStorage, {
  AsyncStorageStatic,
} from '@react-native-async-storage/async-storage'
import {
  onlineManager,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import {cardanoConfig} from '@yoroi/blockchains'
import {
  mountMMKVStorage,
  observableStorageMaker,
  parseBoolean,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {themeStorageMaker} from '@yoroi/theme'
import {App, Balance, HW, Wallet} from '@yoroi/types'
import {Buffer} from 'buffer'
import * as React from 'react'
import {useCallback} from 'react'

import {useStakingInfo} from '../../features/Dashboard/StakePoolInfos'
import {useSelectedNetwork} from '../../features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../features/WalletManager/hooks/useSelectedWallet'
import {isDev, isNightly} from '../../kernel/constants'
import {logger} from '../../kernel/logger/logger'
import {deriveAddressFromXPub} from '../cardano/account-manager/derive-address-from-xpub'
import {getSpendingKey, getStakingKey} from '../cardano/addressInfo/addressInfo'
import {convertBech32ToHex} from '../cardano/common/signatureUtils'
import {WalletEvent, YoroiWallet} from '../cardano/types'

import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TxSubmissionStatus,
} from '../types/other'
import {YoroiSignedTx, YoroiUnsignedTx} from '../types/yoroi'
import {delay} from '../utils/timeUtils'
import {Quantities, Utxos} from '../utils/utils'

const crashReportsStorageKey = 'sendCrashReports'

export const getCrashReportsEnabled = async (
  storage: AsyncStorageStatic = AsyncStorage,
) => {
  const data = await storage.getItem(crashReportsStorageKey)
  return parseBoolean(data) ?? false
}

const useCrashReportsEnabled = (storage: AsyncStorageStatic = AsyncStorage) => {
  const query = useQuery({
    suspense: true,
    queryKey: [crashReportsStorageKey],
    queryFn: () => getCrashReportsEnabled(storage),
    enabled: !isNightly && !isDev,
  })

  if (isNightly || isDev) return true
  return query.data ?? true
}

const useSetCrashReportsEnabled = (
  storage: AsyncStorageStatic = AsyncStorage,
) => {
  const mutation = useMutationWithInvalidations<void, Error, boolean>({
    useErrorBoundary: true,
    mutationFn: async (enabled) => {
      if (enabled) {
        logger.enable()
      } else {
        logger.disable()
      }
      return storage.setItem(crashReportsStorageKey, JSON.stringify(enabled))
    },
    invalidateQueries: [[crashReportsStorageKey]],
  })

  return mutation.mutate
}

export const useCrashReports = () => {
  const set = useSetCrashReportsEnabled()

  return {
    enabled: useCrashReportsEnabled(),
    enable: React.useCallback(() => set(true), [set]),
    disable: React.useCallback(() => set(false), [set]),
  }
}

// WALLET
export const useWallet = (wallet: YoroiWallet, event: WalletEvent['type']) => {
  const [_, rerender] = React.useState({})
  const callback = useCallback(() => rerender({}), [])
  useWalletEvent(wallet, event, callback)
}

export const useWalletEvent = (
  wallet: YoroiWallet,
  event: WalletEvent['type'],
  callback: () => void,
) => {
  React.useEffect(() => {
    const unsubWallet = wallet.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      callback()
    })

    return () => {
      unsubWallet()
    }
  }, [event, wallet, callback])
}

export const useReceiveAddresses = (wallet: YoroiWallet) => {
  useWallet(wallet, 'addresses')
  useWallet(wallet, 'transactions')

  return wallet.receiveAddresses
}

const useUtxos = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return wallet.utxos
}

export const useStakingKey = (wallet: YoroiWallet) => {
  const getPublicKeyHex: () => Promise<string> = () =>
    wallet
      .getStakingKey()
      .then((r) => r.hash())
      .then((h) => h.toBytes())
      .then((bytes) => Buffer.from(bytes).toString('hex'))
  const result = useQuery([wallet.id, 'stakingKey'], getPublicKeyHex, {
    suspense: true,
  })
  if (!result.data) throw new Error('invalid state')
  return result.data
}

export const useAddressHex = (wallet: YoroiWallet) => {
  const result = useQuery(
    [wallet.id, 'addressHex'],
    () => convertBech32ToHex(wallet.externalAddresses[0]),
    {
      suspense: true,
    },
  )
  if (!result.data) throw new Error('invalid state')
  return result.data
}

export const useKeyHashes = ({address}: {address: string}) => {
  const [spendingData, stakingData] = useQueries([
    {
      suspense: true,
      queryKey: [address, 'spendingKeyHash'],
      queryFn: () =>
        getSpendingKey(address).then((spending) => {
          return {spending}
        }),
    },
    {
      suspense: true,
      queryKey: [address, 'stakingkeyHash'],
      queryFn: () =>
        getStakingKey(address).then((staking) => {
          return {staking}
        }),
    },
  ])
  return {
    spending: spendingData.data?.spending,
    staking: stakingData.data?.staking,
  }
}

export const useSync = (
  wallet: YoroiWallet,
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: () => wallet.sync({isForced: true}),
  })

  return {
    ...mutation,
    sync: mutation.mutate,
  }
}

export const usePlate = ({
  chainId,
  publicKeyHex,
  implementation,
}: {
  chainId: number
  publicKeyHex: string
  implementation: Wallet.Implementation
}) => {
  const implementationConfig = cardanoConfig.implementations[implementation]
  const query = useQuery({
    suspense: true,
    queryKey: ['plate', chainId, publicKeyHex],
    queryFn: async () => {
      const addresses = await deriveAddressFromXPub({
        accountPubKeyHex: publicKeyHex,
        chainId,
        count: 1,
        implementation,
        role: implementationConfig.derivations.base.roles.external,
      })
      const accountPlate = walletChecksum(publicKeyHex)
      return {
        addresses,
        accountPlate,
      }
    },
  })

  if (!query.data) throw new Error('invalid state')

  return query.data
}

export const useCreateWithdrawTx = () => {
  const {wallet, meta} = useSelectedWallet()
  const [isLoading, setIsLoading] = React.useState(false)
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})

  const hasRewards =
    stakingInfo?.status === 'staked' //
      ? Quantities.isGreaterThan(stakingInfo.rewards, '0')
      : false

  const createWithdrawalTx = async ({
    shouldDeregister,
    onSuccess,
    onError,
  }: {
    shouldDeregister: boolean
    onSuccess: (unsignedTx: YoroiUnsignedTx) => void
    onError: (error: unknown) => void
  }) => {
    setIsLoading(true)

    try {
      const res = await wallet.createWithdrawalTx({
        shouldDeregister,
        addressMode: meta.addressMode,
      })
      setIsLoading(false)
      onSuccess(res)
    } catch (e) {
      setIsLoading(false)
      onError(e)
    }
  }

  return {hasRewards, isLoading, createWithdrawalTx}
}

type VotingRegTxAndEncryptedKey = {
  votingRegTx: YoroiUnsignedTx
}

export const useVotingRegTx = (
  {
    wallet,
    catalystKeyHex,
    supportsCIP36,
    addressMode,
  }: {
    wallet: YoroiWallet
    catalystKeyHex: string
    supportsCIP36: boolean
    addressMode: Wallet.AddressMode
  },
  options?: UseQueryOptions<
    VotingRegTxAndEncryptedKey,
    Error,
    VotingRegTxAndEncryptedKey,
    [string, string, 'voting-reg-tx', string]
  >,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    cacheTime: 0,
    suspense: true,
    queryKey: [
      catalystKeyHex,
      wallet.id,
      'voting-reg-tx',
      JSON.stringify({supportsCIP36}),
    ],
    queryFn: () =>
      wallet.createVotingRegTx({catalystKeyHex, supportsCIP36, addressMode}),
  })

  if (!query.data) throw new Error('invalid state')

  return query.data.votingRegTx
}

export const useSignWithPasswordAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      YoroiSignedTx,
      Error,
      {unsignedTx: YoroiUnsignedTx; password: string}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx>
  },
) => {
  const signTx = useSignTxWithPassword(
    {wallet},
    {
      useErrorBoundary: true,
      ...options?.signTx,
      onSuccess: (signedTx, args, context) => {
        options?.signTx?.onSuccess?.(signedTx, args, context)
        submitTx.mutate(signedTx)
      },
    },
  )
  const submitTx = useSubmitTx(
    {wallet}, //
    {useErrorBoundary: true, ...options?.submitTx},
  )

  return {
    signAndSubmitTx: signTx.mutate,
    isLoading: signTx.isPending || submitTx.isPending,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignWithHwAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      YoroiSignedTx,
      Error,
      {unsignedTx: YoroiUnsignedTx; useUSB: boolean}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx>
  },
) => {
  const signTx = useSignTxWithHW(
    {wallet},
    {
      useErrorBoundary: true,
      retry: false,
      ...options?.signTx,
      onSuccess: (signedTx, args, context) => {
        options?.signTx?.onSuccess?.(signedTx, args, context)
        submitTx.mutate(signedTx)
      },
    },
  )
  const submitTx = useSubmitTx(
    {wallet}, //
    {useErrorBoundary: true, ...options?.submitTx},
  )

  return {
    signAndSubmitTx: signTx.mutate,
    isLoading: signTx.isPending || submitTx.isPending,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      YoroiSignedTx,
      Error,
      {unsignedTx: YoroiUnsignedTx; rootKey: string}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx>
  },
) => {
  const signTx = useSignTx(
    {wallet},
    {
      useErrorBoundary: true,
      retry: false,
      ...options?.signTx,
      onSuccess: (signedTx, args, context) => {
        options?.signTx?.onSuccess?.(signedTx, args, context)
        submitTx.mutate(signedTx)
      },
    },
  )
  const submitTx = useSubmitTx(
    {wallet}, //
    {useErrorBoundary: true, ...options?.submitTx},
  )

  return {
    signAndSubmitTx: signTx.mutate,
    isLoading: signTx.isPending || submitTx.isPending,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; rootKey: string}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: ({unsignedTx, rootKey}) => wallet.signTx(unsignedTx, rootKey),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useSignTxWithPassword = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; password: string}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, password}) => {
      const rootKey = await wallet.encryptedStorage.xpriv.read(password)
      return wallet.signTx(unsignedTx, rootKey)
    },
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useSignTxWithHW = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; useUSB: boolean; hwDeviceInfo: HW.DeviceInfo}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, useUSB, hwDeviceInfo}) =>
      wallet.signTxWithLedger(unsignedTx, useUSB, hwDeviceInfo),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useTransactionInfos = ({wallet}: {wallet: YoroiWallet}) => {
  const [transactionInfos, setTransactionInfos] = React.useState(
    () => wallet.transactions,
  )

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      setTransactionInfos(() => wallet.transactions)
    })
    return () => unsubscribe?.()
  }, [wallet])

  return transactionInfos
}

export const useHasPendingTx = ({wallet}: {wallet: YoroiWallet}) => {
  const transactionInfos = useTransactionInfos({wallet})

  return Object.values(transactionInfos).some(
    (transactionInfo) =>
      transactionInfo.status === TRANSACTION_STATUS.PENDING &&
      transactionInfo.direction !== TRANSACTION_DIRECTION.RECEIVED,
  )
}

export const useFrontendFees = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<
    App.FrontendFeesResponse,
    Error,
    App.FrontendFeesResponse,
    [string, 'frontend-fees']
  >,
) => {
  const query = useQuery({
    suspense: true,
    queryKey: [wallet.id, 'frontend-fees'],
    ...options,
    queryFn: () =>
      wallet.api.getFrontendFees().catch(() => ({
        // TODO: Without this it break when offline. Needs better fixing
      })),
  })

  return {
    ...query,
    aggregatedFrontendFeeTiers: query.data,
  }
}

export const useIsOnline = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<boolean, Error, boolean, [string, 'isOnline']>,
) => {
  const wasOnline = React.useRef(false)

  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'isOnline'],
    queryFn: () =>
      wallet.checkServerStatus().then(
        () => true,
        () => false,
      ),
    refetchInterval: 15000,
    suspense: true,
    useErrorBoundary: false,
    onSuccess: (isOnline) => {
      if (wasOnline.current === isOnline) return
      wasOnline.current = isOnline
      onlineManager.setOnline(isOnline)
    },
  })

  return query.data
}

export const useSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx> = {},
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async (signedTx) => {
      const serverStatus = await wallet.checkServerStatus()
      const base64 = Buffer.from(signedTx.signedTx.encodedTx).toString('base64')
      await wallet.submitTransaction(base64)

      if (serverStatus.isQueueOnline) {
        return fetchTxStatus(wallet, signedTx.signedTx.id, false)
      }

      return {
        status: 'SUCCESS',
      } as TxSubmissionStatus
    },
    invalidateQueries: [[wallet.id, 'pendingTxs']],
    ...options,
  })

  return {
    submitTx: mutation.mutate,
    ...mutation,
  }
}

const txQueueRetryDelay = process.env.NODE_ENV === 'test' ? 1 : 1000
const txQueueRetryTimes = 5
const fetchTxStatus = async (
  wallet: YoroiWallet,
  txHash: string,
  waitProcessing = false,
): Promise<TxSubmissionStatus> => {
  for (let i = txQueueRetryTimes; i > 0; i -= 1) {
    const txStatus = await wallet.fetchTxStatus({
      txHashes: [txHash],
    })

    const confirmations = txStatus.depth?.[txHash] || 0
    const submission: any = txStatus.submissionStatus?.[txHash]

    // processed
    if (confirmations > 0) {
      return {
        status: 'SUCCESS',
      }
    }

    // not processed and not in the queue
    if (!submission) {
      await delay(txQueueRetryDelay)
      continue
    }

    // if awaiting to process
    if (submission.status === 'WAITING' && waitProcessing) {
      await delay(txQueueRetryDelay)
      continue
    }

    return submission
  }

  // no submission info or waited and didn't process
  return {
    status: 'WAITING',
  }
}

export const useBalances = (wallet: YoroiWallet): Balance.Amounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.portfolioPrimaryTokenInfo.id)
}

export const useResync = (
  wallet: YoroiWallet,
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutation({
    mutationFn: () => wallet.resync(),
    ...options,
  })

  return {
    ...mutation,
    resync: mutation.mutate,
  }
}

export const useSaveMemo = (
  {wallet}: {wallet: YoroiWallet},
  options?: UseMutationOptions<void, Error, {txId: string; memo: string}>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: ({txId, memo}) => wallet.saveMemo(txId, memo),
  })

  return {
    saveMemo: mutation.mutate,
    ...mutation,
  }
}

export const useCreateGovernanceTx = (
  wallet: YoroiWallet,
  options?: UseMutationOptions<
    YoroiUnsignedTx,
    Error,
    {certificates: Certificate[]; addressMode: Wallet.AddressMode}
  >,
) => {
  const mutationFn = ({
    certificates,
    addressMode,
  }: {
    certificates: Certificate[]
    addressMode: Wallet.AddressMode
  }) => {
    return wallet.createUnsignedGovernanceTx({
      votingCertificates: certificates,
      addressMode,
    })
  }

  const mutation = useMutation({mutationFn, retry: false, ...options})
  return {...mutation, createUnsignedGovernanceTx: mutation.mutate}
}

export const useThemeStorageMaker = () => {
  const themeDiscovery = mountMMKVStorage<string>({path: `theme/`})
  const themeDiscoveryStorage = observableStorageMaker(themeDiscovery)

  const themeStorage = themeStorageMaker({storage: themeDiscoveryStorage})

  return themeStorage
}

export const usePoolInfo = ({poolId}: {poolId: string}): FullPoolInfo => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => new PoolInfoApi(networkManager.legacyApiBaseUrl),
    [networkManager.legacyApiBaseUrl],
  )
  const poolInfo = useQuery({
    queryKey: ['usePoolInfo', poolId],
    queryFn: async () => {
      return poolInfoApi.getSingleFullPoolInfo(poolId)
    },
    suspense: true,
  })

  return poolInfo?.data ?? {chain: null, explorer: null}
}
