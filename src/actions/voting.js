// @flow
import type {Dispatch} from 'redux'
import cryptoRandomString from 'crypto-random-string'

import {encryptWithPassword} from '../crypto/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../crypto/shelley/catalystUtils'
import walletManager from '../crypto/walletManager'
import {Logger} from '../utils/logging'
import {CONFIG} from '../config/config'

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
  let pin
  if (CONFIG.DEBUG.PREFILL_FORMS) {
    if (!__DEV__) throw new Error('using debug data in non-dev env')
    pin = CONFIG.DEBUG.CATALYST_PIN
  } else {
    pin = cryptoRandomString({length: 4, type: 'numeric'})
  }

  const pinArray = pin.split('').map(Number)

  const passBuff = Buffer.from(pinArray)
  const rootKey = await generatePrivateKeyForCatalyst()
  const catalystEncryptedPrivateKey = await encryptWithPassword(
    passBuff,
    await (await rootKey.to_raw_key()).as_bytes(),
  )

  await dispatch(
    _setCatalystKeys({
      pin: pinArray,
      encryptedKey: catalystEncryptedPrivateKey,
      catalystPrivateKey: Buffer.from(
        await (await rootKey.to_raw_key()).as_bytes(),
      ).toString('hex'),
    }),
  )
}

export const generateVotingTransaction = (
  decryptedKey: string,
  utxos: Array<RawUtxo>,
) => async (dispatch: Dispatch<any>, getState: () => State) => {
  Logger.debug('voting actions::generateVotingTransaction')
  const catalystPrivateKey: ?string = getState().voting.catalystPrivateKey
  const serverTime: Date | void = getState().serverStatus.serverTime

  if (catalystPrivateKey) {
    const signRequest = await walletManager.createVotingRegTx(
      utxos,
      catalystPrivateKey,
      decryptedKey,
      serverTime,
    )
    dispatch(_setUnSignedTx(signRequest))
  } else {
    // should never happen
    throw new Error('Catalyst private key empty, should never happen')
  }
}
