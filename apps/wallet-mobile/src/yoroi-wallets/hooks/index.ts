/* eslint-disable @typescript-eslint/no-explicit-any */
import {Certificate} from '@emurgo/cross-csl-core'
import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import {
  mountMMKVStorage,
  observableStorageMaker,
  parseBoolean,
  useAsyncStorage,
  useMutationWithInvalidations,
} from '@yoroi/common'
import {themeStorageMaker} from '@yoroi/theme'
import {Api, App, Balance} from '@yoroi/types'
import {Buffer} from 'buffer'
import * as React from 'react'
import {useCallback, useMemo} from 'react'
import {PixelRatio, Platform} from 'react-native'
import {
  onlineManager,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

import {AddressMode, WalletMeta} from '../../features/WalletManager/common/types'
import {parseWalletMeta} from '../../features/WalletManager/common/validators'
import {WalletManager} from '../../features/WalletManager/common/walletManager'
import {useWalletManager} from '../../features/WalletManager/context/WalletManagerContext'
import {isDev, isNightly} from '../../kernel/env'
import {logger} from '../../kernel/logger/logger'
import {getSpendingKey, getStakingKey} from '../cardano/addressInfo/addressInfo'
import {generateShelleyPlateFromKey} from '../cardano/shelley/plate'
import {WalletEvent, YoroiWallet} from '../cardano/types'
import {HWDeviceInfo} from '../hw'
import {
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  YoroiNftModerationStatus,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../types'
import {CurrencySymbol, NetworkId, TipStatusResponse, TxSubmissionStatus, WalletImplementationId} from '../types/other'
import {delay} from '../utils/timeUtils'
import {Amounts, Quantities, Utxos} from '../utils/utils'

const crashReportsStorageKey = 'sendCrashReports'

export const getCrashReportsEnabled = async (storage: AsyncStorageStatic = AsyncStorage) => {
  if (isNightly || isDev) return true
  const data = await storage.getItem(crashReportsStorageKey)
  return parseBoolean(data) ?? false
}

export const useCrashReportsEnabled = (storage: AsyncStorageStatic = AsyncStorage) => {
  const query = useQuery({
    suspense: true,
    queryKey: [crashReportsStorageKey],
    queryFn: () => getCrashReportsEnabled(storage),
  })

  if (query.data == null) throw new Error('invalid state')

  return query.data
}

export const useSetCrashReportsEnabled = (storage: AsyncStorageStatic = AsyncStorage) => {
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

export const useWalletEvent = (wallet: YoroiWallet, event: WalletEvent['type'], callback: () => void) => {
  const walletManager = useWalletManager()

  React.useEffect(() => {
    const unsubWallet = wallet.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      callback()
    })
    const unsubWalletManager = walletManager.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      callback()
    })

    return () => {
      unsubWallet()
      unsubWalletManager()
    }
  }, [event, wallet, walletManager, callback])
}

export const useReceiveAddresses = (wallet: YoroiWallet) => {
  useWallet(wallet, 'addresses')
  useWallet(wallet, 'transactions')

  return wallet.receiveAddresses
}

export const useUtxos = (wallet: YoroiWallet) => {
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
  const result = useQuery([wallet.id, 'stakingKey'], getPublicKeyHex, {suspense: true})
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
  return {spending: spendingData.data?.spending, staking: stakingData.data?.staking}
}

export const useAssetIds = (wallet: YoroiWallet): string[] => {
  const balances = useBalances(wallet)
  return Object.keys(balances).filter((id) => wallet.primaryTokenInfo.id !== id)
}

export const useSync = (wallet: YoroiWallet, options?: UseMutationOptions<void, Error>) => {
  const mutation = useMutation({
    ...options,
    mutationFn: () => wallet.sync({isForced: true}),
  })

  return {
    ...mutation,
    sync: mutation.mutate,
  }
}

export const useWalletName = (wallet: YoroiWallet, options?: UseQueryOptions<string, Error>) => {
  const storage = useAsyncStorage()
  const query = useQuery({
    queryKey: [wallet.id, 'name'],
    queryFn: async () => {
      const walletMeta = await storage.join('wallet/').getItem(wallet.id, parseWalletMeta)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return walletMeta.name
    },
    ...options,
  })

  return query.data
}

export const useChangeWalletName = (wallet: YoroiWallet, options: UseMutationOptions<void, Error, string> = {}) => {
  const storage = useAsyncStorage()
  const mutation = useMutationWithInvalidations<void, Error, string>({
    mutationFn: async (newName) => {
      const walletMeta = await storage.join('wallet/').getItem(wallet.id, parseWalletMeta)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return storage.join('wallet/').setItem(wallet.id, {...walletMeta, name: newName})
    },
    invalidateQueries: [[wallet.id, 'name'], ['walletMetas']],
    ...options,
  })

  return {
    renameWallet: mutation.mutate,

    ...mutation,
  }
}

export const useTokenInfo = <T extends Balance.TokenInfo>(
  {wallet, tokenId}: {wallet: YoroiWallet; tokenId: string},
  options?: UseQueryOptions<Balance.TokenInfo, Error, T, [string, 'tokenInfo', string]>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
    staleTime: 600_000,
  })

  if (!query.data) throw new Error('Invalid token id')

  return query.data
}

export const useNftModerationStatus = (
  {wallet, fingerprint}: {wallet: YoroiWallet; fingerprint: string},
  options?: UseQueryOptions<YoroiNftModerationStatus, Error, YoroiNftModerationStatus, [string, 'nft', string]>,
) => {
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'nft', fingerprint],
    queryFn: () => wallet.fetchNftModerationStatus(fingerprint),
  })

  return {
    ...query,
    status: query.data,
  }
}

export const useNftImageModerated = ({
  wallet,
  nftId,
}: {
  wallet: YoroiWallet
  nftId: string
}): {image?: string; status: YoroiNftModerationStatus} | null => {
  const nft = useNft(wallet, {id: nftId})
  const fingerprint = nft.fingerprint
  const {status} = useNftModerationStatus({wallet, fingerprint})
  return useMemo(() => (status ? {image: nft.image, status} : null), [nft, status])
}

export const useToken = (
  {wallet, tokenId}: {wallet: YoroiWallet; tokenId: string},
  options?: UseQueryOptions<Balance.TokenInfo, Error, Balance.TokenInfo, [string, 'tokenInfo', string]>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
    staleTime: 600_000,
  })

  if (!query.data) throw new Error('Invalid token id')

  return useTokenInfos({wallet, tokenIds: [tokenId]}, options)[0]
}

export const useTokenInfosDetailed = (
  {wallet, tokenIds}: {wallet: YoroiWallet; tokenIds: Array<string>},
  options?: UseQueryOptions<Balance.TokenInfo, Error, Balance.TokenInfo, any>,
) => {
  const queries = tokenIds.map((tokenId) => ({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
    staleTime: 600_000,
  }))
  return useQueries(queries)
}

export const useTokenInfos = (
  {wallet, tokenIds}: {wallet: YoroiWallet; tokenIds: Array<string>},
  options?: UseQueryOptions<Balance.TokenInfo, Error, Balance.TokenInfo, any>,
) => {
  const results = useTokenInfosDetailed({wallet, tokenIds}, options)
  return results.reduce((result, {data}) => (data ? [...result, data] : result), [] as Array<Balance.TokenInfo>)
}

export const usePlate = ({networkId, publicKeyHex}: {networkId: NetworkId; publicKeyHex: string}) => {
  const query = useQuery({
    suspense: true,
    queryKey: ['plate', networkId, publicKeyHex],
    queryFn: () => generateShelleyPlateFromKey(publicKeyHex, 1, networkId),
  })

  if (!query.data) throw new Error('invalid state')

  return query.data
}

export const useWithdrawalTx = (
  {
    wallet,
    deregister = false,
  }: {
    wallet: YoroiWallet
    deregister?: boolean
  },
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'withdrawalTx', {deregister: boolean}]>,
) => {
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'withdrawalTx', {deregister}],
    queryFn: async () => wallet.createWithdrawalTx(deregister),
    retry: false,
    cacheTime: 0,
    useErrorBoundary: true,
    suspense: true,
  })

  return {
    withdrawalTx: query.data,
    ...query,
  }
}

export type VotingRegTxAndEncryptedKey = {
  votingRegTx: YoroiUnsignedTx
  votingKeyEncrypted: string
}

export const useVotingRegTx = (
  {wallet, pin, supportsCIP36}: {wallet: YoroiWallet; pin: string; supportsCIP36: boolean},

  options?: UseQueryOptions<
    VotingRegTxAndEncryptedKey,
    Error,
    VotingRegTxAndEncryptedKey,
    [string, 'voting-reg-tx', string]
  >,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    cacheTime: 0,
    suspense: true,
    queryKey: [wallet.id, 'voting-reg-tx', JSON.stringify({supportsCIP36})],
    queryFn: () => wallet.createVotingRegTx(pin, supportsCIP36),
  })

  if (!query.data) throw new Error('invalid state')

  return query.data.votingRegTx
}

export const useSignWithPasswordAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; password: string}>
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
    isLoading: signTx.isLoading || submitTx.isLoading,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignWithHwAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; useUSB: boolean}>
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
    isLoading: signTx.isLoading || submitTx.isLoading,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; rootKey: string}>
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
    isLoading: signTx.isLoading || submitTx.isLoading,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}

export const useSignTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; rootKey: string}> = {},
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
  options: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; password: string}> = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, password}) => {
      const rootKey = await wallet.encryptedStorage.rootKey.read(password)
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
  options: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; useUSB: boolean}> = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, useUSB}) => wallet.signTxWithLedger(unsignedTx, useUSB),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useTransactionInfos = (wallet: YoroiWallet) => {
  const [transactionInfos, setTransactionInfos] = React.useState(() => wallet.transactions)
  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      setTransactionInfos(wallet.transactions)
    })
    return () => unsubscribe?.()
  }, [wallet])

  return transactionInfos
}

export const useHasPendingTx = (wallet: YoroiWallet) => {
  const transactionInfos = useTransactionInfos(wallet)

  return Object.values(transactionInfos).some(
    (transactionInfo) =>
      transactionInfo.status === TRANSACTION_STATUS.PENDING &&
      transactionInfo.direction !== TRANSACTION_DIRECTION.RECEIVED,
  )
}

// WALLET MANAGER
export const useDisableEasyConfirmation = (wallet: YoroiWallet, options?: UseMutationOptions) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: () => walletManager.disableEasyConfirmation(wallet),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    disableEasyConfirmation: mutation.mutate,
  }
}

export const useEnableEasyConfirmation = (wallet: YoroiWallet, options?: UseMutationOptions<void, Error, string>) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: (password: string) => walletManager.enableEasyConfirmation(wallet, password),
    invalidateQueries: [['walletMetas']],
  })

  return {
    ...mutation,
    enableEasyConfirmation: mutation.mutate,
  }
}

export const useEasyConfirmationEnabled = (wallet: YoroiWallet) => {
  useWallet(wallet, 'easy-confirmation')

  return wallet.isEasyConfirmationEnabled
}

export const useWalletNames = (
  walletManager: WalletManager,
  options?: UseQueryOptions<Array<WalletMeta>, Error, Array<string>>,
) => {
  const query = useQuery({
    queryKey: ['walletMetas'],
    queryFn: async () => walletManager.listWallets(),
    select: (walletMetas) => walletMetas.map((walletMeta) => walletMeta.name),
    ...options,
  })

  return {
    ...query,
    walletNames: query.data,
  }
}

export const useFrontendFees = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<App.FrontendFeesResponse, Error, App.FrontendFeesResponse, [string, 'frontend-fees']>,
) => {
  const query = useQuery({
    suspense: true,
    queryKey: [wallet.id, 'frontend-fees'],
    ...options,
    queryFn: () => wallet.api.getFrontendFees(),
  })

  return {
    ...query,
    frontendFees: query.data,
  }
}

export const useProtocolParams = (
  wallet: YoroiWallet,
  options?: UseQueryOptions<
    Api.Cardano.ProtocolParamsResult,
    Error,
    Api.Cardano.ProtocolParamsResult,
    [string, 'protocol-params']
  >,
) => {
  const query = useQuery({
    suspense: true,
    queryKey: [wallet.id, 'protocol-params'],
    ...options,
    queryFn: () => wallet.getProtocolParams(),
  })

  return {
    ...query,
    protocolParams: query.data,
  }
}

export const useWalletMetas = (walletManager: WalletManager, options?: UseQueryOptions<Array<WalletMeta>, Error>) => {
  const query = useQuery({
    queryKey: ['walletMetas'],
    queryFn: async () => walletManager.listWallets(),
    ...options,
  })

  return {
    ...query,
    walletMetas: query.data,
  }
}

export const hasWalletsKey = 'hasWallets'
export const useHasWallets = (
  walletManager: WalletManager,
  options?: UseQueryOptions<Array<WalletMeta>, Error, boolean>,
) => {
  const query = useQuery({
    queryKey: [hasWalletsKey],
    queryFn: async () => walletManager.listWallets(),
    select: (walletMetas) => walletMetas.length > 0,
    suspense: true,
    ...options,
  })

  if (query.data == null) throw new Error('invalid state')

  return {
    ...query,
    hasWallets: query.data,
  }
}

export const useRemoveWallet = (id: YoroiWallet['id'], options: UseMutationOptions<void, Error, void> = {}) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations({
    mutationFn: () => walletManager.removeWallet(id),
    invalidateQueries: [['walletMetas']],
    ...options,
  })

  return {
    removeWallet: mutation.mutate,
    ...mutation,
  }
}

type CreateBip44WalletInfo = {
  name: string
  bip44AccountPublic: string
  networkId: NetworkId
  implementationId: WalletImplementationId
  hwDeviceInfo?: null | HWDeviceInfo
  readOnly: boolean
  addressMode: AddressMode
}

export const useCreateBip44Wallet = (options?: UseMutationOptions<YoroiWallet, Error, CreateBip44WalletInfo>) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations<YoroiWallet, Error, CreateBip44WalletInfo>({
    mutationFn: ({name, bip44AccountPublic, networkId, implementationId, hwDeviceInfo, readOnly, addressMode}) =>
      walletManager.createWalletWithBip44Account(
        name,
        bip44AccountPublic,
        networkId,
        implementationId,
        hwDeviceInfo || null,
        readOnly,
        addressMode,
      ),
    invalidateQueries: [['walletMetas']],
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}

export type CreateWalletInfo = {
  name: string
  mnemonicPhrase: string
  password: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  addressMode: AddressMode
}

export const useCreateWallet = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletInfo>) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations({
    mutationFn: ({name, mnemonicPhrase, password, networkId, walletImplementationId, addressMode}) =>
      walletManager.createWallet(name, mnemonicPhrase, password, networkId, walletImplementationId, addressMode),
    invalidateQueries: [['walletMetas']],
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
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

export const useTipStatus = ({
  wallet,
  options,
}: {
  wallet: YoroiWallet
  options?: UseQueryOptions<TipStatusResponse, Error>
}) => {
  const query = useQuery<TipStatusResponse, Error>({
    suspense: true,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1000,
    queryKey: [wallet.networkId, 'tipStatus'],
    queryFn: () => wallet.fetchTipStatus(),
    ...options,
  })

  if (!query.data) throw new Error('Failed to retrive tipStatus')

  return query.data
}

export const useExchangeRate = ({
  wallet,
  to,
  options,
}: {
  wallet: YoroiWallet
  to: CurrencySymbol
  options?: UseQueryOptions<number, Error>
}) => {
  const query = useQuery<number, Error>({
    suspense: true,
    staleTime: 60000,
    retryDelay: 1000,
    queryKey: [wallet.id, 'exchangeRate', {to}],
    queryFn: () => (to === 'ADA' ? 1 : wallet.fetchCurrentPrice(to)),
    ...options,
  })

  return query.data
}

export const useBalances = (wallet: YoroiWallet): Balance.Amounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.primaryTokenInfo.id)
}

export const useBalance = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string | undefined}) => {
  const balances = useBalances(wallet)

  if (tokenId == null) return Quantities.zero
  return Amounts.getAmount(balances, tokenId).quantity
}

export const useResync = (wallet: YoroiWallet, options?: UseMutationOptions<void, Error>) => {
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

export const useNft = (wallet: YoroiWallet, {id}: {id: string}): Balance.TokenInfo => {
  const tokenInfo = useTokenInfo({wallet, tokenId: id}, {suspense: true})

  if (tokenInfo.kind !== 'nft') {
    throw new Error(`Invalid id used "${id}" to get NFT`)
  }
  return tokenInfo
}

const supportedTypes = [
  'img/png', // Yeah, someone minted that
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/svg',
  'image/tiff',
]

const supportedSizes = [64, 128, 256, 512, 720] as const

const getClosestSize = (size: string | number) => {
  const pixels = PixelRatio.getPixelSizeForLayoutSize(Number(size))
  return supportedSizes.find((size) => pixels <= size) ?? supportedSizes.at(-1)
}

type NativeAssetImageRequest = {
  networkId: NetworkId
  policy: string
  name: string
  width: string | number
  height: string | number
  mediaType?: string
  contentFit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  kind?: 'logo' | 'metadata'
}
export const useNativeAssetImage = ({
  networkId,
  policy,
  name,
  width: _width,
  height: _height,
  mediaType: _mediaType = 'image/webp',
  contentFit = 'cover',
  kind = 'metadata',
}: NativeAssetImageRequest) => {
  const network = networkId === 300 ? 'preprod' : 'mainnet'
  const width = getClosestSize(_width)
  const height = getClosestSize(_height)
  const mediaType = _mediaType.toLocaleLowerCase()
  const isMediaTypeSupported = supportedTypes.includes(mediaType)
  const needsGif = mediaType === 'image/gif' && Platform.OS === 'ios'
  const mimeType = needsGif ? 'image/gif' : 'image/webp'
  const headers = useMemo(
    () => ({
      Accept: mimeType,
    }),
    [mimeType],
  )
  const queryClient = useQueryClient()

  const [isError, setError] = React.useState(false)
  const [isLoading, setLoading] = React.useState(true)

  const queryKey = ['native-asset-img', policy, name, `${width}x${height}`, contentFit]

  const query = useQuery({
    enabled: isMediaTypeSupported,
    staleTime: Infinity,
    queryKey,
    queryFn: (context) => {
      const count = queryClient.getQueryState(context.queryKey)?.dataUpdateCount
      const cache = count ? `&cache=${count}` : ''
      const requestUrl = `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=${width}&height=${height}&kind=${kind}&fit=${contentFit}${cache}`

      setLoading(true)
      return requestUrl
    },
  })

  const timerRef = React.useRef<ReturnType<typeof setTimeout>>()
  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  const onError = useCallback(() => {
    const count = queryClient.getQueryState(queryKey)?.dataUpdateCount
    if (count && count < 10) {
      timerRef.current = setTimeout(query.refetch, count * 300)
    } else {
      setError(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, queryClient])

  const onLoad = useCallback(() => {
    setLoading(false)
  }, [])

  return {
    ...query,
    uri: query.data,
    headers,
    isError: isError || query.isError,
    isLoading: isLoading || query.isLoading,
    onError,
    onLoad,
  }
}

export const useCreateGovernanceTx = (
  wallet: YoroiWallet,
  options?: UseMutationOptions<YoroiUnsignedTx, Error, Certificate[]>,
) => {
  const mutationFn = (certificates: Certificate[]) => {
    return wallet.createUnsignedGovernanceTx(certificates)
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
