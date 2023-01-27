/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import {delay} from 'bluebird'
import {mapValues} from 'lodash'
import * as React from 'react'
import {
  onlineManager,
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

import {isNightly} from '../legacy/config'
import {ObjectValues} from '../legacy/flow'
import {HWDeviceInfo} from '../legacy/ledgerUtils'
import {processTxHistoryData} from '../legacy/processTransactions'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {useWalletManager} from '../WalletManager'
import {
  calcLockedDeposit,
  NetworkId,
  toToken,
  TxSubmissionStatus,
  WalletEvent,
  WalletImplementationId,
  WalletManager,
  YoroiProvider,
  YoroiWallet,
} from '../yoroi-wallets'
import {generateShelleyPlateFromKey} from '../yoroi-wallets/cardano/shelley/plate'
import {
  Quantity,
  TokenInfo,
  Transaction,
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TransactionInfo,
  YoroiAmounts,
  YoroiSignedTx,
  YoroiUnsignedTx,
} from '../yoroi-wallets/types'
import {CurrencySymbol, TipStatusResponse} from '../yoroi-wallets/types/other'
import {Amounts, Utxos} from '../yoroi-wallets/utils'
import {parseBoolean} from '../yoroi-wallets/utils/parsing'

const crashReportsStorageKey = 'sendCrashReports'

export const getCrashReportsEnabled = async (storage: AsyncStorageStatic = AsyncStorage) => {
  if (isNightly()) return true

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
    mutationFn: (enabled) => storage.setItem(crashReportsStorageKey, JSON.stringify(enabled)),
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
  const walletManager = useWalletManager()
  const [_, rerender] = React.useState({})

  React.useEffect(() => {
    const unsubWallet = wallet.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      rerender(() => ({}))
    })
    const unsubWalletManager = walletManager.subscribe((subscriptionEvent) => {
      if (subscriptionEvent.type !== event) return
      rerender(() => ({}))
    })

    return () => {
      unsubWallet()
      unsubWalletManager()
    }
  }, [event, wallet, walletManager])
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

/**
 * Calculate the lovelace locked up to hold utxos with assets
 * Important `minAdaRequired` is missing `has_hash_data`
 * which could be adding 10 in size to calc the words of the utxo
 *
 * @summary Returns the locked amount in Lovelace
 */
export const useLockedAmount = (
  {wallet}: {wallet: YoroiWallet},
  options?: UseQueryOptions<Quantity, Error, Quantity, [string, 'lockedAmount']>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'lockedAmount'],
    queryFn: () => calcLockedDeposit(wallet.utxos, wallet.networkId).then((amount) => amount.toString() as Quantity),
  })

  React.useEffect(() => {
    const unsubscribe = wallet.subscribe(({type}) => type === 'utxos' && query.refetch())

    return () => unsubscribe?.()
  }, [query, wallet])

  if (query.data == null) throw new Error('invalid state')

  return query.data
}

export const useSync = (wallet: YoroiWallet, options?: UseMutationOptions<void, Error>) => {
  const mutation = useMutation({
    ...options,
    mutationFn: () => wallet.sync(),
  })

  return {
    ...mutation,
    sync: mutation.mutate,
  }
}

export const useCloseWallet = (options: UseMutationOptions<void, Error> = {}) => {
  const walletManager = useWalletManager()
  const mutation = useMutation({
    mutationFn: () => walletManager.closeWallet(),
    ...options,
  })

  return {
    ...mutation,
    closeWallet: mutation.mutate,
  }
}

export const useWalletName = (wallet: YoroiWallet, options?: UseQueryOptions<string, Error>) => {
  const query = useQuery({
    queryKey: [wallet.id, 'name'],
    queryFn: async () => {
      const walletMeta = await storage.read<WalletMeta>(`/wallet/${wallet.id}`)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return walletMeta.name
    },
    ...options,
  })

  return query.data
}

export const useChangeWalletName = (wallet: YoroiWallet, options: UseMutationOptions<void, Error, string> = {}) => {
  const mutation = useMutationWithInvalidations<void, Error, string>({
    mutationFn: async (newName) => {
      const walletMeta = await storage.read<WalletMeta>(`/wallet/${wallet.id}`)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return storage.write(`/wallet/${wallet.id}`, {...walletMeta, name: newName})
    },
    invalidateQueries: [[wallet.id, 'name'], ['walletMetas']],
    ...options,
  })

  return {
    renameWallet: mutation.mutate,

    ...mutation,
  }
}

export const useTokenInfo = (
  {wallet, tokenId}: {wallet: YoroiWallet; tokenId: string},
  options?: UseQueryOptions<TokenInfo, Error, TokenInfo, [string, 'tokenInfo', string]>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
  })

  if (!query.data) throw new Error('Invalid token id')

  return query.data
}

export const useToken = (
  {wallet, tokenId}: {wallet: YoroiWallet; tokenId: string},
  options?: UseQueryOptions<TokenInfo, Error, TokenInfo, [string, 'tokenInfo', string]>,
) => {
  const query = useQuery({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
  })

  if (!query.data) throw new Error('Invalid token id')

  return toToken({wallet, tokenInfo: query.data})
}

export const useTokenInfos = (
  {wallet, tokenIds}: {wallet: YoroiWallet; tokenIds: Array<string>},
  options?: UseQueryOptions<TokenInfo, Error, TokenInfo, any>,
) => {
  const queries = tokenIds.map((tokenId) => ({
    ...options,
    suspense: true,
    queryKey: [wallet.id, 'tokenInfo', tokenId],
    queryFn: () => wallet.fetchTokenInfo(tokenId),
  }))
  const queryResults = useQueries(queries)

  return queryResults.reduce((result, {data}) => (data ? [...result, data] : result), [] as Array<TokenInfo>)
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
  {wallet, pin}: {wallet: YoroiWallet; pin: string},

  options?: UseQueryOptions<VotingRegTxAndEncryptedKey, Error, VotingRegTxAndEncryptedKey, [string, 'voting-reg-tx']>,
) => {
  const query = useQuery({
    ...options,
    retry: false,
    cacheTime: 0,
    suspense: true,
    queryKey: [wallet.id, 'voting-reg-tx'],
    queryFn: () => wallet.createVotingRegTx(pin),
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

export const useTransactionInfo = (
  {wallet, txid}: {wallet: YoroiWallet; txid: string},
  options?: UseQueryOptions<TransactionInfo, Error, TransactionInfo, [string, 'transactionInfo', {txid: string}]>,
) => {
  const {data} = useQuery({
    ...options,
    suspense: true,
    refetchInterval: 5000,
    queryKey: [wallet.id, 'transactionInfo', {txid}],
    queryFn: async () => {
      const txInfos = await wallet.getTransactions([txid])
      return txInfos[txid]
    },
  })

  if (!data) throw new Error('invalid state')

  return data
}

const getTransactionInfos = (wallet: YoroiWallet) =>
  mapValues(wallet.transactions, (tx: Transaction) => {
    if (!wallet.networkId) throw new Error('invalid state')
    return processTxHistoryData(
      tx,
      wallet.rewardAddressHex != null
        ? [...wallet.internalAddresses, ...wallet.externalAddresses, ...[wallet.rewardAddressHex]]
        : [...wallet.internalAddresses, ...wallet.externalAddresses],
      wallet.confirmationCounts[tx.id] || 0,
      wallet.networkId,
    )
  })

export const useTransactionInfos = (wallet: YoroiWallet) => {
  const [transactionInfos, setTransactionInfos] = React.useState(() => getTransactionInfos(wallet))
  React.useEffect(() => {
    const unsubscribe = wallet.subscribe((event) => {
      if (event.type !== 'transactions') return

      setTransactionInfos(getTransactionInfos(wallet))
    })
    return () => unsubscribe?.()
  }, [wallet])

  return transactionInfos
}

export const useHasPendingTx = (wallet: YoroiWallet) => {
  const transactionInfos = useTransactionInfos(wallet)

  return ObjectValues(transactionInfos).some(
    (transactionInfo) =>
      transactionInfo.status === TRANSACTION_STATUS.PENDING &&
      transactionInfo.direction !== TRANSACTION_DIRECTION.RECEIVED,
  )
}

// WALLET MANAGER
export const useOpenWallet = (options?: UseMutationOptions<[YoroiWallet, WalletMeta], Error, WalletMeta>) => {
  const walletManager = useWalletManager()
  const mutation = useMutation({
    ...options,
    mutationFn: (walletMeta) => Promise.all([walletManager.openWallet(walletMeta), walletMeta]),
  })

  return {
    openWallet: mutation.mutate,
    ...mutation,
  }
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

export const useHasWallets = (
  walletManager: WalletManager,
  options?: UseQueryOptions<Array<WalletMeta>, Error, boolean>,
) => {
  const query = useQuery({
    queryKey: ['walletMetas'],
    queryFn: async () => walletManager.listWallets(),
    select: (walletMetas) => walletMetas.length > 0,
    suspense: true,
    ...options,
  })

  if (query.data == null) throw new Error('invalid state')

  return query.data
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
  networkId: number
  implementationId: WalletImplementationId
  hwDeviceInfo?: null | HWDeviceInfo
  readOnly: boolean
}

export const useCreateBip44Wallet = (options?: UseMutationOptions<YoroiWallet, Error, CreateBip44WalletInfo>) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations<YoroiWallet, Error, CreateBip44WalletInfo>({
    mutationFn: ({name, bip44AccountPublic, networkId, implementationId, hwDeviceInfo, readOnly}) =>
      walletManager.createWalletWithBip44Account(
        name,
        bip44AccountPublic,
        networkId,
        implementationId,
        hwDeviceInfo || null,
        readOnly,
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
  networkId: number
  walletImplementationId: WalletImplementationId
  provider?: YoroiProvider
}

export const useCreateWallet = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletInfo>) => {
  const walletManager = useWalletManager()
  const mutation = useMutationWithInvalidations({
    mutationFn: ({name, mnemonicPhrase, password, networkId, walletImplementationId, provider}) =>
      walletManager.createWallet(name, mnemonicPhrase, password, networkId, walletImplementationId, provider),
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
    refetchInterval: 5000,
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
export const fetchTxStatus = async (
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

export const useMutationWithInvalidations = <TData = unknown, TError = unknown, TVariables = void, TContext = unknown>({
  invalidateQueries,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {invalidateQueries?: Array<QueryKey>} = {}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: (variables) => {
      invalidateQueries?.forEach((key) => queryClient.cancelQueries(key))
      return options?.onMutate?.(variables)
    },
    onSuccess: (data, variables, context) => {
      invalidateQueries?.forEach((key) => queryClient.invalidateQueries(key))
      return options?.onSuccess?.(data, variables, context)
    },
  })
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

export const useBalances = (wallet: YoroiWallet): YoroiAmounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.primaryTokenInfo.id)
}

export const useBalance = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const balances = useBalances(wallet)

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
