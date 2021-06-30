// @flow
import cryptoRandomString from 'crypto-random-string'

import {encryptWithPassword} from '../crypto/catalystCipher'
import {generatePrivateKeyForCatalyst} from '../crypto/shelley/catalystUtils'
import walletManager from '../crypto/walletManager'
import {Logger} from '../utils/logging'
import {CONFIG} from '../config/config'
import {fetchUTXOs} from '../actions/utxo'
import {utxosSelector} from '../selectors'

import type {State} from '../state'
import type {Dispatch} from 'redux'

const _setCatalystKeys = (voting) => ({
  type: 'SET_CATALYST_KEYS',
  path: ['voting'],
  payload: voting,
  reducer: (state, value) => value,
})

const _setUnsignedTx = (unsignedTx) => ({
  type: 'SET_CATALYST_TX',
  path: ['voting', 'unsignedTx'],
  payload: unsignedTx,
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
  Logger.debug('voting actions::generateVotingKeys: success')
}

export const generateVotingTransaction = (
  decryptedKey: string | void,
) => async (dispatch: Dispatch<any>, getState: () => State) => {
  Logger.debug('voting actions::generateVotingTransaction')
  const catalystPrivateKey: ?string = getState().voting.catalystPrivateKey
  const serverTime: Date | void = getState().serverStatus.serverTime
  let utxos = utxosSelector(getState())
  if (utxos == null) {
    try {
      await dispatch(fetchUTXOs())
      utxos = utxosSelector(getState())
    } catch (_e) {
      Logger.debug(
        'voting actions::generateVotingTransaction: could not get utxos',
      )
      dispatch(_setUnsignedTx(null))
    }
  }
  utxos = utxosSelector(getState())
  if (utxos == null) {
    throw new Error(
      'voting actions::generateVotingTransaction: failed to fetch utxos',
    )
  }

  if (catalystPrivateKey) {
    const signRequest = await walletManager.createVotingRegTx(
      utxos,
      catalystPrivateKey,
      decryptedKey,
      serverTime,
    )
    dispatch(_setUnsignedTx(signRequest))
    Logger.debug('voting actions::generateVotingTransaction: success')
  } else {
    // should never happen
    throw new Error('Catalyst private key empty, should never happen')
  }
}
