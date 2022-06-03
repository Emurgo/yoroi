import {TxMetadata} from '@emurgo/yoroi-lib-core'
import BigNumber from 'bignumber.js'
import {delay} from 'bluebird'
import cryptoRandomString from 'crypto-random-string'
import {IntlShape} from 'react-intl'
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

import KeyStore from '../legacy/KeyStore'
import {HWDeviceInfo} from '../legacy/ledgerUtils'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {RawUtxo} from '../legacy/types'
import {Storage} from '../Storage'
import {SendTokenList, Token} from '../types'
import {
  decryptWithPassword,
  encryptWithPassword,
  NetworkId,
  TxSubmissionStatus,
  WalletImplementationId,
  walletManager,
  YoroiProvider,
  YoroiWallet,
} from '../yoroi-wallets'
import {generateShelleyPlateFromKey} from '../yoroi-wallets/cardano/shelley/plate'
import {CardanoSignedTx, CardanoUnsignedTx, YoroiSignedTx, YoroiUnsignedTx} from '../yoroi-wallets/types'

// WALLET
export const useCloseWallet = (options?: UseMutationOptions<void, Error>) => {
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

export const primaryTokenInfo: Token = {
  networkId: 1,
  identifier: '',
  isDefault: true,
  metadata: {
    type: 'Cardano',
    policyId: '',
    assetName: '',
    ticker: 'ADA',
    longName: null,
    numberOfDecimals: 6,
    maxSupply: String(45000000000000000),
  },
} as const

export const primaryTokenInfoTestnet: Token = {
  networkId: 300,
  identifier: '',
  isDefault: true,
  metadata: {
    type: 'Cardano',
    policyId: '',
    assetName: '',
    ticker: 'TADA',
    longName: null,
    numberOfDecimals: 6,
    maxSupply: String(45000000000000000),
  },
} as const

export const useTokenInfo = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const _queryKey = queryKey({wallet, tokenId})
  const query = useQuery<Token, Error>({
    suspense: true,
    queryKey: _queryKey,
    queryFn: () => fetchTokenInfo({wallet, tokenId}),
  })

  if (!query.data) throw new Error('Invalid token id')

  return query.data
}

export const useTokenInfos = ({wallet, tokenIds}: {wallet: YoroiWallet; tokenIds: Array<string>}) => {
  const queries = useQueries(
    tokenIds.map((tokenId: string) => ({
      queryKey: queryKey({wallet, tokenId}),
      queryFn: () => fetchTokenInfo({wallet, tokenId}),
    })),
  )

  const tokens = queries
    .filter((result) => result.isSuccess)
    .map((result) => {
      if (!result.data) throw new Error('Invalid tokenInfo')

      return result.data
    })
    .reduce((result, current) => ({...result, [current.identifier]: current}), {} as Record<string, Token>)

  return queries.every((query) => !query.isLoading) ? tokens : undefined
}

export const queryKey = ({wallet, tokenId}) => [wallet.id, 'tokenInfo', tokenId]
export const fetchTokenInfo = async ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}): Promise<Token> => {
  if ((tokenId === '' || tokenId === 'ADA') && wallet.networkId === 1) return primaryTokenInfo
  if ((tokenId === '' || tokenId === 'ADA' || tokenId === 'TADA') && wallet.networkId === 300)
    return primaryTokenInfoTestnet

  const tokenSubject = tokenId.replace('.', '')
  const tokenMetadatas = await wallet.fetchTokenInfo({tokenIds: [tokenSubject]})
  const tokenMetadata = tokenMetadatas[tokenSubject]

  if (!tokenMetadata) {
    return {
      networkId: wallet.networkId,
      identifier: tokenId,
      isDefault: false,
      metadata: {
        type: 'Cardano',
        policyId: tokenId.split('.')[0],
        assetName: tokenId.split('.')[1],
        ticker: null,
        longName: null,
        numberOfDecimals: 0,
        maxSupply: null,
      },
    }
  }

  return {
    networkId: 300,
    identifier: tokenId,
    isDefault: false,
    metadata: {
      type: 'Cardano',
      policyId: tokenId.split('.')[0],
      assetName: tokenId.split('.')[1],
      ticker: null,
      longName: null,
      numberOfDecimals: tokenMetadata.decimals || 0,
      maxSupply: null,
    },
  }
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

export const useUnsignedTx = (
  {
    wallet,
    receiver,
    tokens,
    auxiliary,

    serverTime,
    utxos,
    defaultToken,
  }: {
    wallet: YoroiWallet
    receiver: string
    tokens: SendTokenList
    auxiliary: Array<TxMetadata>

    serverTime: Date | null
    utxos: Array<RawUtxo>
    defaultToken: Token
  },
  options?: UseQueryOptions<YoroiUnsignedTx>,
) => {
  const query = useQuery({
    queryKey: [wallet.id, 'unsignedTx', tokens],
    queryFn: () => wallet.createUnsignedTx(utxos, receiver, tokens, defaultToken, serverTime, auxiliary),
    retry: false,
    cacheTime: 0,
    ...options,
  })

  return {
    unsignedTx: query.data,
    ...query,
  }
}

export const useWithdrawalTx = (
  {
    wallet,
    utxos,
    deregister = false,
    serverTime,
  }: {
    wallet: YoroiWallet
    utxos: Array<RawUtxo>
    deregister?: boolean
    serverTime?: Date
  },
  options?: UseQueryOptions<YoroiUnsignedTx>,
) => {
  const query = useQuery({
    queryKey: [wallet.id, 'withdrawalTx', {deregister}],
    queryFn: () => wallet.createWithdrawalTx(utxos, deregister, serverTime),
    retry: false,
    cacheTime: 0,
    ...options,
  })

  return {
    withdrawalTx: query.data,
    ...query,
  }
}

export const useStakingTx = (
  {
    wallet,
    poolId,
    accountValue,
    utxos,
    defaultAsset,
    serverTime,
  }: {
    wallet: YoroiWallet
    poolId: string
    accountValue: string
    utxos: Array<RawUtxo>
    defaultAsset: Token
    serverTime?: Date
  },
  options?: UseQueryOptions<YoroiUnsignedTx>,
) => {
  const query = useQuery({
    queryKey: [wallet.id, 'stakingTx', {poolId}],
    queryFn: () => wallet.createDelegationTx(poolId, new BigNumber(accountValue), utxos, defaultAsset, serverTime),
    retry: false,
    cacheTime: 0,
    ...options,
  })

  return {
    stakingTx: query.data,
    ...query,
  }
}

// WALLET MANAGER
export const useCreatePin = (storage: Storage, options: UseMutationOptions<void, Error, string>) => {
  const mutation = useMutation({
    mutationFn: async (pin) => {
      const installationId = await storage.getItem('/appSettings/installationId')
      if (!installationId) throw new Error('Invalid installation id')
      const installationIdHex = Buffer.from(installationId, 'utf-8').toString('hex')
      const pinHex = Buffer.from(pin, 'utf-8').toString('hex')
      const saltHex = cryptoRandomString({length: 2 * 32})
      const nonceHex = cryptoRandomString({length: 2 * 12})
      const encryptedPinHash = await encryptWithPassword(pinHex, saltHex, nonceHex, installationIdHex)

      return storage.setItem(ENCRYPTED_PIN_HASH_KEY, JSON.stringify(encryptedPinHash))
    },
    ...options,
  })

  return {
    createPin: mutation.mutate,
    ...mutation,
  }
}

export const useCheckPin = (storage: Storage, options: UseMutationOptions<boolean, Error, string> = {}) => {
  const mutation = useMutation({
    mutationFn: (pin) =>
      Promise.resolve(ENCRYPTED_PIN_HASH_KEY)
        .then(storage.getItem)
        .then((data) => {
          if (!data) throw new Error('missing pin')
          return data
        })
        .then(JSON.parse)
        .then((encryptedPinHash: string) => decryptWithPassword(toHex(pin), encryptedPinHash))
        .then(() => true)
        .catch((error) => {
          if (error.message === 'Decryption error') return false
          throw error
        }),
    retry: false,
    ...options,
  })

  return {
    checkPin: mutation.mutate,
    isValid: mutation.data,
    ...mutation,
  }
}

const ENCRYPTED_PIN_HASH_KEY = '/appSettings/customPinHash'
const toHex = (text: string) => Buffer.from(text, 'utf8').toString('hex')

export const useWalletNames = () => {
  return useWalletMetas<Array<string>>({
    select: (walletMetas) => walletMetas.map((walletMeta) => walletMeta.name),
  })
}

export const useWalletMetas = <T = Array<WalletMeta>>(options?: UseQueryOptions<Array<WalletMeta>, Error, T>) => {
  const query = useQuery({
    queryKey: ['walletMetas'],
    queryFn: async () => {
      const keys = await storage.keys('/wallet/')
      const walletMetas = await Promise.all(keys.map((key) => storage.read<WalletMeta>(`/wallet/${key}`)))

      return walletMetas
    },
    ...options,
  })

  return query.data
}

export const useRemoveWallet = (options: UseMutationOptions<void, Error, void>) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: () => walletManager.removeCurrentWallet(),
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

export const useMasterKey = (
  {wallet, intl}: {wallet: YoroiWallet; intl: any},
  options?: UseMutationOptions<string, Error, string>,
) => {
  const query = useMutation({
    mutationFn: (password) => KeyStore.getData(wallet.id, 'MASTER_PASSWORD', '', password, intl),
    ...options,
  })

  return {
    getMasterKey: query.data,
    ...query,
  }
}

export const useUpdateHWDeviceInfo = ({wallet}: {wallet: YoroiWallet}) => {
  const mutation = useMutation({
    mutationFn: (hwDeviceInfo: HWDeviceInfo) =>
      storage.write(`/wallet/${wallet.id}/data`, {
        ...wallet.toJSON(),
        hwDeviceInfo,
      }),
  })

  return {
    updateHWDeviceInfo: mutation.mutate,
    ...mutation,
  }
}

export const useSignWithPasswordAndSubmitTx = (
  {wallet, storage}: {wallet: YoroiWallet; storage: typeof KeyStore},
  options?: {
    signTx?: UseMutationOptions<YoroiSignedTx, Error, {unsignedTx: YoroiUnsignedTx; password: string; intl: IntlShape}>
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx>
  },
) => {
  const signTx = useSignTxWithPassword(
    {wallet, storage},
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
    signTx?: UseMutationOptions<CardanoSignedTx, Error, {unsignedTx: CardanoUnsignedTx; useUSB: boolean}>
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, CardanoSignedTx>
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
    signTx?: UseMutationOptions<CardanoSignedTx, Error, {unsignedTx: CardanoUnsignedTx; masterKey: string}>
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, CardanoSignedTx>
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
  options: UseMutationOptions<CardanoSignedTx, Error, {unsignedTx: CardanoUnsignedTx; masterKey: string}> = {},
) => {
  const mutation = useMutation({
    mutationFn: ({unsignedTx, masterKey}) => wallet.signTx(unsignedTx, masterKey),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}

export const useSignTxWithPassword = (
  {wallet, storage}: {wallet: YoroiWallet; storage: typeof KeyStore},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; password: string; intl: IntlShape}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, password, intl}) => {
      const masterKey = await storage.getData(wallet.id, 'MASTER_PASSWORD', '', password, intl)

      return wallet.signTx(unsignedTx, masterKey)
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
  options: UseMutationOptions<CardanoSignedTx, Error, {unsignedTx: CardanoUnsignedTx; useUSB: boolean}> = {},
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

export const useSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<TxSubmissionStatus, Error, CardanoSignedTx> = {},
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
