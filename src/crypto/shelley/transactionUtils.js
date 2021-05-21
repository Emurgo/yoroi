// @flow
import {BigNumber} from 'bignumber.js'
import {
  BigNum,
  LinearFee,
  TransactionMetadata,
} from '@emurgo/react-native-haskell-shelley'

import {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'
import {sendAllUnsignedTx, newAdaUnsignedTx} from './transactions'
import {hasSendAllDefault, builtSendTokenList} from '../commonUtils'
import {multiTokenFromRemote} from './utils'
import {CardanoError, InsufficientFunds, NoOutputsError} from '../errors'
import {Logger} from '../../utils/logging'
import assert from '../../utils/assert'

import type {Addressing, AddressedUtxo, SendTokenList} from '../types'
import type {CardanoHaskellShelleyNetwork} from '../../config/networks'
import type {DefaultTokenEntry} from '../MultiToken'

export type CreateUnsignedTxRequest = {|
  changeAddr: {
    address: string,
    ...Addressing,
  },
  absSlotNumber: BigNumber,
  receiver: string,
  addressedUtxos: Array<AddressedUtxo>,
  defaultToken: DefaultTokenEntry,
  tokens: SendTokenList,
  metadata: TransactionMetadata | void,
  networkConfig: CardanoHaskellShelleyNetwork,
|}

export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest

export const createUnsignedTx = async (
  request: CreateUnsignedTxRequest,
): Promise<CreateUnsignedTxResponse> => {
  Logger.debug('createUnsignedTx called', request)
  const {
    changeAddr,
    receiver,
    addressedUtxos,
    absSlotNumber,
    metadata,
    networkConfig,
  } = request
  try {
    const KEY_DEPOSIT = networkConfig.KEY_DEPOSIT
    const POOL_DEPOSIT = networkConfig.POOL_DEPOSIT
    const LINEAR_FEE = networkConfig.LINEAR_FEE
    const MINIMUM_UTXO_VAL = networkConfig.MINIMUM_UTXO_VAL
    const NETWORK_ID = networkConfig.NETWORK_ID
    const CHAIN_NETWORK_ID = networkConfig.CHAIN_NETWORK_ID

    const protocolParams = {
      keyDeposit: await BigNum.from_str(KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.from_str(LINEAR_FEE.COEFFICIENT),
        await BigNum.from_str(LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.from_str(MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.from_str(POOL_DEPOSIT),
      networkId: NETWORK_ID,
    }

    let unsignedTxResponse
    if (hasSendAllDefault(request.tokens)) {
      assert.assert(receiver != null, 'sendAll requires a receiver address')
      unsignedTxResponse = await sendAllUnsignedTx(
        {address: receiver},
        addressedUtxos,
        absSlotNumber,
        protocolParams,
        metadata,
      )
    } else {
      assert.assert(
        changeAddr.address != null && changeAddr.addressing != null,
        'change address missing, should never happen',
      )
      unsignedTxResponse = await newAdaUnsignedTx(
        [
          {
            address: receiver,
            amount: builtSendTokenList(
              request.defaultToken,
              request.tokens,
              addressedUtxos.map((utxo) =>
                multiTokenFromRemote(utxo, protocolParams.networkId),
              ),
            ),
          },
        ],
        {
          address: changeAddr.address,
          addressing: changeAddr.addressing,
        },
        addressedUtxos,
        absSlotNumber,
        protocolParams,
        [], // no certificates
        [], // no withdrawals
        false, // do not allow no outputs
        metadata,
      )
    }

    Logger.debug(
      `createUnsignedTx success: ${JSON.stringify(unsignedTxResponse)}`,
    )
    return new HaskellShelleyTxSignRequest(
      unsignedTxResponse.senderUtxos,
      unsignedTxResponse.txBuilder,
      unsignedTxResponse.changeAddr,
      metadata,
      {
        NetworkId: NETWORK_ID,
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
