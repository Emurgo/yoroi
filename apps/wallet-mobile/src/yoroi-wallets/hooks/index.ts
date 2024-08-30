/* eslint-disable @typescript-eslint/no-explicit-any */
import {walletChecksum} from '@emurgo/cip4-js'
import {Certificate} from '@emurgo/cross-csl-core'
import AsyncStorage, {AsyncStorageStatic} from '@react-native-async-storage/async-storage'
import {mountMMKVStorage, observableStorageMaker, parseBoolean, useMutationWithInvalidations} from '@yoroi/common'
import {themeStorageMaker} from '@yoroi/theme'
import {App, Balance, HW, Wallet} from '@yoroi/types'
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

import {useSelectedNetwork} from '../../features/WalletManager/common/hooks/useSelectedNetwork'
import {isDev, isNightly} from '../../kernel/env'
import {logger} from '../../kernel/logger/logger'
import {deriveAddressFromXPub} from '../cardano/account-manager/derive-address-from-xpub'
import {getSpendingKey, getStakingKey} from '../cardano/addressInfo/addressInfo'
import {cardanoConfig} from '../cardano/constants/cardano-config'
import {WalletEvent, YoroiWallet} from '../cardano/types'
import {TRANSACTION_DIRECTION, TRANSACTION_STATUS, YoroiSignedTx, YoroiUnsignedTx} from '../types'
import {TipStatusResponse, TxSubmissionStatus} from '../types/other'
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

export const useWithdrawalTx = (
  {
    wallet,
    addressMode,
    deregister = false,
  }: {
    wallet: YoroiWallet
    addressMode: Wallet.AddressMode
    deregister?: boolean
  },
  options?: UseQueryOptions<YoroiUnsignedTx, Error, YoroiUnsignedTx, [string, 'withdrawalTx', {deregister: boolean}]>,
) => {
  const query = useQuery({
    ...options,
    queryKey: [wallet.id, 'withdrawalTx', {deregister}],
    queryFn: async () => wallet.createWithdrawalTx({shouldDeregister: deregister, addressMode}),
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
}

export const useVotingRegTx = (
  {
    wallet,
    catalystKeyHex,
    supportsCIP36,
    addressMode,
  }: {wallet: YoroiWallet; catalystKeyHex: string; supportsCIP36: boolean; addressMode: Wallet.AddressMode},
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
    queryKey: [catalystKeyHex, wallet.id, 'voting-reg-tx', JSON.stringify({supportsCIP36})],
    queryFn: () => wallet.createVotingRegTx({catalystKeyHex, supportsCIP36, addressMode}),
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
    mutationFn: async ({unsignedTx, useUSB, hwDeviceInfo}) => wallet.signTxWithLedger(unsignedTx, useUSB, hwDeviceInfo),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useTransactionInfos = ({wallet}: {wallet: YoroiWallet}) => {
  const [transactionInfos, setTransactionInfos] = React.useState(() => wallet.transactions)

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

// TODO: tipStatus is a network responsability
export const useTipStatus = ({
  wallet,
  options,
}: {
  wallet: YoroiWallet
  options?: UseQueryOptions<TipStatusResponse, Error>
}) => {
  const {network} = useSelectedNetwork()
  const query = useQuery<TipStatusResponse, Error>({
    suspense: true,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1000,
    queryKey: [network, 'tipStatus'],
    queryFn: () => wallet.fetchTipStatus(),
    ...options,
  })

  if (!query.data) throw new Error('Failed to retrive tipStatus')

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
  policy: string
  name: string
  width: string | number
  height: string | number
  mediaType?: string
  contentFit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside'
  kind?: 'logo' | 'metadata'
}
export const useNativeAssetImage = ({
  policy,
  name,
  width: _width,
  height: _height,
  mediaType: _mediaType = 'image/webp',
  contentFit = 'cover',
  kind = 'metadata',
}: NativeAssetImageRequest) => {
  const {network} = useSelectedNetwork()
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
  options?: UseMutationOptions<YoroiUnsignedTx, Error, {certificates: Certificate[]; addressMode: Wallet.AddressMode}>,
) => {
  const mutationFn = ({certificates, addressMode}: {certificates: Certificate[]; addressMode: Wallet.AddressMode}) => {
    return wallet.createUnsignedGovernanceTx({votingCertificates: certificates, addressMode})
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
