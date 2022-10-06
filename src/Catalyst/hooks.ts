import {useMutation, UseMutationOptions} from 'react-query'

import {useBalances} from '../hooks'
import {CONFIG, getDefaultAssetByNetworkId, isHaskellShelley} from '../legacy/config'
import {generatePrivateKeyForCatalyst, YoroiWallet} from '../yoroi-wallets'
import {Quantity, YoroiUnsignedTx} from '../yoroi-wallets/types'
import {Amounts, Quantities} from '../yoroi-wallets/utils'
import {encryptWithPassword} from './catalystCipher'

export type VotingRegTxVariables = {
  pin: string
  decryptedKey?: string
}
export type VotingRegTxData = {
  catalystSKHexEncrypted: string
  yoroiUnsignedTx: YoroiUnsignedTx
}
export const useCreateVotingRegTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<VotingRegTxData, Error, VotingRegTxVariables> = {},
) => {
  const mutation = useMutation<VotingRegTxData, Error, VotingRegTxVariables>({
    mutationFn: async ({pin, decryptedKey}) => {
      const utxos = await wallet.fetchUTXOs()

      if (!utxos) throw new Error('Connection issues. Failed to fetch utxos')
      if (!utxos?.length) throw new Error('No balance to perform this operation')

      const password = Buffer.from(pin.split('').map(Number))
      const rootKey = await generatePrivateKeyForCatalyst()
      const [catalystSKHexEncrypted, catalystSKHex] = await rootKey
        .toRawKey()
        .then((x) => x.asBytes())
        .then((x) => Promise.all([encryptWithPassword(password, x), Buffer.from(x).toString('hex')]))

      const defaultAsset = getDefaultAssetByNetworkId(wallet.networkId)
      const yoroiUnsignedTx = await wallet.createVotingRegTx(utxos, catalystSKHex, defaultAsset, decryptedKey)

      return {
        catalystSKHexEncrypted,
        yoroiUnsignedTx,
      }
    },
    ...options,
  })

  return {
    createVotingRegTx: mutation.mutate,
    ...mutation,
  }
}

export const useCanVote = (wallet: YoroiWallet) => {
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, '')
  const sufficientFunds = Quantities.isGreaterThan(
    primaryAmount.quantity,
    CONFIG.CATALYST.MIN_ADA.toString() as Quantity,
  )

  return {
    canVote: isHaskellShelley(wallet.walletImplementationId),
    sufficientFunds,
  }
}
