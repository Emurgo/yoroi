import {useMutation, UseMutationOptions} from 'react-query'

import {getDefaultAssetByNetworkId} from '../legacy/config'
import {generatePrivateKeyForCatalyst, YoroiWallet} from '../yoroi-wallets'
import {YoroiUnsignedTx} from '../yoroi-wallets/types'
import {encryptWithPassword} from './catalystCipher'

export type VotingRegTxVariables = {
  pin: string
  decryptedKey?: string
}
export type VotingRegTxData = {
  catalystSKHexEncrypted: string
  yoroiTx: YoroiUnsignedTx
}
export const useCreateVotingRegTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<VotingRegTxData, Error, VotingRegTxVariables> = {},
) => {
  const mutation = useMutation<VotingRegTxData, Error, VotingRegTxVariables>({
    mutationFn: async ({pin, decryptedKey}) => {
      const serverTime = (await wallet.checkServerStatus())?.serverTime
      const time = serverTime ? new Date(serverTime) : new Date()
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
      const yoroiTx = await wallet.createVotingRegTx(utxos, catalystSKHex, defaultAsset, decryptedKey, time)

      return {
        catalystSKHexEncrypted,
        yoroiTx,
      }
    },
    ...options,
  })

  return {
    createVotingRegTx: mutation.mutate,
    ...mutation,
  }
}
