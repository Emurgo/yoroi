// @flow
import {BigNumber} from 'bignumber.js'
import {
  BigNum,
  LinearFee,
  TransactionBuilder,
} from 'react-native-haskell-shelley'

import {sendAllUnsignedTx, newAdaUnsignedTx} from './transactions'
import {NETWORKS} from '../../config/networks'
import {CardanoError, InsufficientFunds} from '../errors'
import {Logger} from '../../utils/logging'

import type {Addressing, AddressedUtxo, BaseSignRequest} from '../types'

export type CreateUnsignedTxRequest = {|
  changeAddr: {
    address: string,
    ...Addressing,
  },
  absSlotNumber: BigNumber,
  receiver: string,
  addressedUtxos: Array<AddressedUtxo>,
  ...
    | {|
        amount: string, // in lovelaces
      |}
    | {|
        shouldSendAll: true,
      |},
|}

export type CreateUnsignedTxResponse = BaseSignRequest<TransactionBuilder>

export const createUnsignedTx = async (
  request: CreateUnsignedTxRequest,
): Promise<CreateUnsignedTxResponse> => {
  Logger.debug('createUnsignedTx called', request)
  const {changeAddr, receiver, addressedUtxos, absSlotNumber} = request
  try {
    const KEY_DEPOSIT = NETWORKS.HASKELL_SHELLEY.KEY_DEPOSIT
    const LINEAR_FEE = NETWORKS.HASKELL_SHELLEY.LINEAR_FEE
    const MINIMUM_UTXO_VAL = NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL
    const POOL_DEPOSIT = NETWORKS.HASKELL_SHELLEY.POOL_DEPOSIT

    const protocolParams = {
      keyDeposit: await BigNum.from_str(KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.from_str(LINEAR_FEE.COEFFICIENT),
        await BigNum.from_str(LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.from_str(MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.from_str(POOL_DEPOSIT),
    }

    let unsignedTxResponse
    if (request.shouldSendAll != null) {
      unsignedTxResponse = await sendAllUnsignedTx(
        receiver,
        addressedUtxos,
        absSlotNumber,
        protocolParams,
      )
    } else if (request.amount != null) {
      const amount = request.amount

      unsignedTxResponse = await newAdaUnsignedTx(
        [{address: receiver, amount}],
        {
          address: changeAddr.address,
          addressing: changeAddr.addressing,
        },
        addressedUtxos,
        absSlotNumber,
        protocolParams,
        [],
        [],
        false,
      )
    } else {
      throw new Error('shelley::createUnsignedTx:: unknown param')
    }
    Logger.debug(
      `createUnsignedTx success: ${JSON.stringify(unsignedTxResponse)}`,
    )
    // TODO(V-almonacid): Should we instead return a HaskellShelleyTxSignRequest
    // instance like in yoroi frontend?
    return {
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      changeAddr: unsignedTxResponse.changeAddr,
      certificate: undefined,
    }
  } catch (e) {
    if (e instanceof InsufficientFunds) throw e
    Logger.error(`shelley::createUnsignedTx:: ${e.message}`, e)
    throw new CardanoError(e.message)
  }
}
