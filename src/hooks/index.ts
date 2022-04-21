/* eslint-disable @typescript-eslint/no-explicit-any */
import {delay} from 'bluebird'
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query'

import {HWDeviceInfo} from '../legacy/ledgerUtils'
import {WalletMeta} from '../legacy/state'
import storage from '../legacy/storage'
import {Token} from '../types'
import {
  NetworkId,
  SignedTx,
  TxSubmissionStatus,
  WalletImplementationId,
  walletManager,
  YoroiProvider,
  YoroiWallet,
} from '../yoroi-wallets'
import {generateShelleyPlateFromKey} from '../yoroi-wallets/cardano/shelley/plate'

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
      const walletMeta = await storage.read<WalletMeta>(`/wallets/${wallet.id}`)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return storage.write(`/wallets/${wallet.id}`, {...walletMeta, name: newName})
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

// WALLET MANAGER
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

export const useSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<TxSubmissionStatus, Error, SignedTx> = {},
) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async (signedTx) => {
      const serverStatus = await wallet.checkServerStatus()
      await wallet.submitTransaction(signedTx.base64)

      if (serverStatus.isQueueOnline) {
        return fetchTxStatus(wallet, signedTx.id, false)
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
