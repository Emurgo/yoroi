import {UseMutationOptions} from 'react-query'
import {useDispatch} from 'react-redux'

import {useCloseWallet} from '../hooks'
import {clearAccountState} from './account'
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

export {useCloseWalletWrapper as useCloseWallet}
