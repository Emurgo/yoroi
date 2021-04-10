// @flow
import type {Dispatch} from 'redux'
import cryptoRandomString from 'crypto-random-string'
import {PrivateKey} from '@emurgo/react-native-haskell-shelley'

import {encryptWithPassword} from '../crypto/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../crypto/shelley/catalystUtils'
import walletManager from '../crypto/walletManager'
import {Logger} from '../utils/logging'
import type {RawUtxo} from '../api/types'

import type {State} from '../state'

const _setCatalystKeys = (voting) => ({
  type: 'SET_CATALYST_KEYS',
  path: ['voting'],
  payload: voting,
  reducer: (state, value) => value,
})

const _setUnSignedTx = (unSignedTx) => ({
  type: 'SET_CATALYST_TX',
  path: ['voting', 'unSignedTx'],
  payload: unSignedTx,
  reducer: (state, value) => value,
})

export const generateVotingKeys = () => async (
  dispatch: Dispatch<any>,
  _getState: () => State,
) => {
  Logger.debug('voting actions::generateVotingKeys')
  const pin = cryptoRandomString({length: 4, type: 'numeric'})
  const pinArray = pin.split('').map(Number)

  const passBuff = Buffer.from(pinArray)
  const rootKey = await generatePrivateKeyForCatalyst()
  const key = await encryptWithPassword(
    passBuff,
    await (await rootKey.to_raw_key()).as_bytes(),
  )

  dispatch(
    _setCatalystKeys({
      pin: pinArray,
      encryptedKey: key,
      catalystPrivateKey: await PrivateKey.from_extended_bytes(
        await (await rootKey.to_raw_key()).as_bytes(),
      ),
    }),
  )
}

export const generateVotingTransaction = (
  decryptedKey: string,
  utxos: Array<RawUtxo>,
) => async (dispatch: Dispatch<any>, getState: () => State) => {
  const catalystPrivateKey = getState().voting.catalystPrivateKey

  if (catalystPrivateKey) {
    const signRequest = await walletManager.createVotingRegTx(
      utxos,
      catalystPrivateKey,
      decryptedKey,
    )
    dispatch(_setUnSignedTx(signRequest))
  } else {
    // should never happen
    throw new Error(
      'Catalyst private key empty, should never happen',
    )
  }
}
