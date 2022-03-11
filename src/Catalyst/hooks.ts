import {useMutation, UseMutationOptions} from 'react-query'

import {encryptWithPassword} from '../../legacy/crypto/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../../legacy/crypto/shelley/catalystUtils'
import {HaskellShelleyTxSignRequest} from '../../legacy/crypto/shelley/HaskellShelleyTxSignRequest'
import {WalletInterface} from '../types'

export type VotingRegTxVariables = {
  pin: string
  decryptedKey?: string
}
export type VotingRegTxData = {
  catalystSKHex: string
  catalystSKHexEncrypted: string
  signRequest: HaskellShelleyTxSignRequest
}
export const useCreateVotingRegTx = (
  {wallet}: {wallet: WalletInterface},
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
        .to_raw_key()
        .then((x) => x.as_bytes())
        .then((x) => Promise.all([encryptWithPassword(password, x), Buffer.from(x).toString('hex')]))

      const signRequest: HaskellShelleyTxSignRequest = await wallet.createVotingRegTx(
        utxos,
        catalystSKHex,
        decryptedKey,
        time,
      )

      return {
        catalystSKHex,
        catalystSKHexEncrypted,
        signRequest,
      }
    },
    ...options,
  })

  return {
    createVotingRegTx: mutation.mutate,
    ...mutation,
  }
}
