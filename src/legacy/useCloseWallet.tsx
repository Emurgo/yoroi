import {UseMutationOptions} from 'react-query'
import {useDispatch} from 'react-redux'

import {useCloseWallet, useCloseWalletWithWalletMeta} from '../hooks'
import {clearAccountState} from './account'
import {WalletMeta} from './state'
import {clearUTXOs} from './utxo'

const useCloseWalletWrapper = (options: UseMutationOptions<void, Error> = {}) => {
  const dispatch = useDispatch()

  const {closeWallet, ...mutation} = useCloseWallet({
    onSuccess: () => {
      dispatch(clearUTXOs())
      dispatch(clearAccountState())
    },
    ...options,
  })

  return {closeWallet, ...mutation}
}

const useCloseWalletWithWalletMetaWrapper = (options: UseMutationOptions<WalletMeta, Error, WalletMeta> = {}) => {
  const dispatch = useDispatch()

  const {closeWalletWithWalletMeta, ...mutation} = useCloseWalletWithWalletMeta({
    onSuccess: (walletMeta, args, context) => {
      dispatch(clearUTXOs())
      dispatch(clearAccountState())
      options?.onSuccess?.(walletMeta, args, context)
    },
    ...options,
  })

  return {closeWalletWithWalletMeta, ...mutation}
}

export {useCloseWalletWrapper as useCloseWallet, useCloseWalletWithWalletMetaWrapper as useCloseWalletWithWalletMeta}
