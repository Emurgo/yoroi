import React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions} from 'react-query'
import {useSelector} from 'react-redux'

import walletManager from '../../legacy/crypto/walletManager'
import {availableAssetsSelector, tokenInfoSelector} from '../../legacy/selectors'
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

export const useTokenInfos = () => {
  const availableAssets = useSelector(availableAssetsSelector) as Record<string, Token>
  const tokenInfos = useSelector(tokenInfoSelector)

  return React.useMemo(() => ({...availableAssets, ...tokenInfos}), [availableAssets, tokenInfos])
}

export const useTokenInfo = (tokenId: string) => {
  const tokenInfo = useTokenInfos()[tokenId]

  if (!tokenInfo) throw new Error('Missing tokenInfo')

  return tokenInfo
}

// WALLET MANAGER
export const useWalletNames = () => {
  const query = useQuery<Array<string>, Error>({
    queryKey: 'walletNames',
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
