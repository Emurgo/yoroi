// @flow
import {BigNumber} from 'bignumber.js'
import {BigNum, LinearFee} from 'react-native-haskell-shelley'

import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import {sendAllUnsignedTx, newAdaUnsignedTx} from './transactions'
import {NETWORKS} from '../../config/networks'
import {CardanoError, InsufficientFunds, NoOutputsError} from '../errors'
import {Logger} from '../../utils/logging'

import type {Addressing, AddressedUtxo} from '../types'

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

export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest

export const createUnsignedTx = async (
  request: CreateUnsignedTxRequest,
): Promise<CreateUnsignedTxResponse> => {
  Logger.debug('createUnsignedTx called', request)
  const {changeAddr, receiver, addressedUtxos, absSlotNumber} = request
  try {
    const NETWORK_CONFIG = NETWORKS.HASKELL_SHELLEY

    const KEY_DEPOSIT = NETWORK_CONFIG.KEY_DEPOSIT
    const POOL_DEPOSIT = NETWORK_CONFIG.POOL_DEPOSIT
    const LINEAR_FEE = NETWORK_CONFIG.LINEAR_FEE
    const MINIMUM_UTXO_VAL = NETWORK_CONFIG.MINIMUM_UTXO_VAL
    const CHAIN_NETWORK_ID = NETWORK_CONFIG.CHAIN_NETWORK_ID

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
    return new HaskellShelleyTxSignRequest(
      {
        senderUtxos: unsignedTxResponse.senderUtxos,
        unsignedTx: unsignedTxResponse.txBuilder,
        changeAddr: unsignedTxResponse.changeAddr,
        certificate: undefined,
      },
      undefined,
      {
        ChainNetworkId: Number.parseInt(CHAIN_NETWORK_ID, 10),
        KeyDeposit: new BigNumber(KEY_DEPOSIT),
        PoolDeposit: new BigNumber(POOL_DEPOSIT),
      },
      {
        neededHashes: new Set(),
        wits: new Set(),
      },
    )
  } catch (e) {
    if (e instanceof InsufficientFunds || e instanceof NoOutputsError) throw e
    Logger.error(`shelley::createUnsignedTx:: ${e.message}`, e)
    throw new CardanoError(e.message)
  }
}
