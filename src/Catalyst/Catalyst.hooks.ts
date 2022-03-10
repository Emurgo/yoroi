import {useMutation, UseMutationOptions} from 'react-query'
import {useSelector} from 'react-redux'

import {encryptWithPassword} from '../../legacy/crypto/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../../legacy/crypto/shelley/catalystUtils'
import {HaskellShelleyTxSignRequest} from '../../legacy/crypto/shelley/HaskellShelleyTxSignRequest'
import {serverStatusSelector, utxosSelector} from '../../legacy/selectors'
import {WalletInterface} from '../types'

export type CatalystVariables = {
  pin: string
  decryptedKey?: string
}
export type CatalystData = {
  catalystSKHex: string
  catalystSKHexEncrypted: string
  signRequest: HaskellShelleyTxSignRequest
}
export const useCatalyst = (
  {wallet}: {wallet: WalletInterface},
  options: UseMutationOptions<CatalystData, Error, CatalystVariables> = {},
) => {
  const serverStatus = useSelector(serverStatusSelector)
  const utxos = useSelector(utxosSelector)
  const mutation = useMutation<CatalystData, Error, CatalystVariables>({
    mutationFn: async ({pin, decryptedKey}) => {
      const time = serverStatus.serverTime

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

  return mutation
}
