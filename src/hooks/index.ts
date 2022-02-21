import {useMutation, UseMutationOptions, useQueries, useQuery, useQueryClient, UseQueryOptions} from 'react-query'

import walletManager from '../../legacy/crypto/walletManager'
import {WalletMeta} from '../../legacy/state'
import {WalletInterface} from '../types'
import {Token} from '../types/cardano'

// WALLET
export const useWalletName = (wallet: WalletInterface, options?: UseQueryOptions<string, Error>) => {
  const query = useQuery({
    queryKey: [wallet.id, 'name'],
    queryFn: async () => {
      const walletMetas: Array<WalletMeta> = await walletManager.listWallets()
      const walletMeta = walletMetas.find((walletMeta) => walletMeta.id === wallet.id)
      if (!walletMeta) throw new Error('Invalid wallet id')

      return walletMeta.name
    },
    ...options,
  })

  return query.data
}

export const useChangeWalletName = (wallet: WalletInterface, options: UseMutationOptions<void, Error, string> = {}) => {
  const queryClient = useQueryClient()
  const {onSuccess, ...rest} = options
  const mutation = useMutation<void, Error, string>({
    mutationFn: (newName) => walletManager.rename(newName),
    onSuccess: (...args) => {
      onSuccess?.(...args)
      queryClient.invalidateQueries([wallet.id, 'name'])
      queryClient.invalidateQueries(['walletMetas'])
    },
    ...rest,
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
    maxSupply: String(45000000000),
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
    maxSupply: String(45000000000),
  },
} as const

export const useTokenInfo = ({wallet, tokenId}: {wallet: WalletInterface; tokenId: string}) => {
  const _queryKey = queryKey({wallet, tokenId})
  const query = useQuery<Token, Error>({
    suspense: true,
    queryKey: _queryKey,
    queryFn: () => fetchTokenInfo({wallet, tokenId}),
  })

  if (!query.data) throw new Error('Invalid token id')

  return query.data
}

export const useTokenInfos = ({wallet, tokenIds}: {wallet: WalletInterface; tokenIds: Array<string>}) => {
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
export const fetchTokenInfo = async ({wallet, tokenId}: {wallet: WalletInterface; tokenId: string}): Promise<Token> => {
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

// WALLET MANAGER
export const useWalletNames = () => {
  const query = useQuery<Array<string>, Error>({
    queryKey: ['walletNames'],
    queryFn: async () => {
      const walletMetas = await walletManager.listWallets()

      return walletMetas.map((walletMeta: WalletMeta) => walletMeta.name)
    },
  })

  return query.data
}

export const useWalletMetas = () => {
  const query = useQuery<Array<WalletMeta>, Error>({
    queryKey: ['walletMetas'],
    queryFn: async () => {
      const walletMetas = await walletManager.listWallets()

      return walletMetas
    },
  })

  return query.data
}

export const useRemoveWallet = (mutationOptions: UseMutationOptions<void, Error, void>) => {
  const queryClient = useQueryClient()
  const {onSuccess, ...options} = mutationOptions || {}
  const mutation = useMutation({
    mutationFn: () => walletManager.removeCurrentWallet(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries('walletMetas')
      onSuccess?.(...args)
    },
    ...options,
  })

  return {
    removeWallet: mutation.mutate,
    ...mutation,
  }
}
