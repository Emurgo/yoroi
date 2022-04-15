import {BigNumber} from 'bignumber.js'

import assert from '../../../legacy/assert'
import {builtSendTokenList, hasSendAllDefault} from '../../../legacy/commonUtils'
import {CardanoError, InsufficientFunds, NoOutputsError} from '../../../legacy/errors'
import {Logger} from '../../../legacy/logging'
import {multiTokenFromRemote} from '../../../legacy/utils'
import {BigNum, CreateUnsignedTxRequest, HaskellShelleyTxSignRequest, LinearFee} from '../..'
import {newAdaUnsignedTx, sendAllUnsignedTx} from './transactions'

export type CreateUnsignedTxResponse = HaskellShelleyTxSignRequest

export const createUnsignedTx = async (request: CreateUnsignedTxRequest): Promise<CreateUnsignedTxResponse> => {
  Logger.debug('createUnsignedTx called', request)
  const {changeAddr, receiver, addressedUtxos, absSlotNumber, auxiliaryData, networkConfig} = request
  try {
    const KEY_DEPOSIT = networkConfig.KEY_DEPOSIT
    const POOL_DEPOSIT = networkConfig.POOL_DEPOSIT
    const LINEAR_FEE = networkConfig.LINEAR_FEE
    const MINIMUM_UTXO_VAL = networkConfig.MINIMUM_UTXO_VAL
    const NETWORK_ID = networkConfig.NETWORK_ID
    const CHAIN_NETWORK_ID = networkConfig.CHAIN_NETWORK_ID

    const protocolParams = {
      keyDeposit: await BigNum.fromStr(KEY_DEPOSIT),
      linearFee: await LinearFee.new(
        await BigNum.fromStr(LINEAR_FEE.COEFFICIENT),
        await BigNum.fromStr(LINEAR_FEE.CONSTANT),
      ),
      minimumUtxoVal: await BigNum.fromStr(MINIMUM_UTXO_VAL),
      poolDeposit: await BigNum.fromStr(POOL_DEPOSIT),
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
        auxiliaryData,
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
              addressedUtxos.map((utxo) => multiTokenFromRemote(utxo, protocolParams.networkId)),
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
        auxiliaryData,
      )
    }

    Logger.debug(`createUnsignedTx success: ${JSON.stringify(unsignedTxResponse)}`)
    return new HaskellShelleyTxSignRequest({
      senderUtxos: unsignedTxResponse.senderUtxos,
      unsignedTx: unsignedTxResponse.txBuilder,
      changeAddr: unsignedTxResponse.changeAddr,
      auxiliaryData,
      networkSettingSnapshot: {
        NetworkId: NETWORK_ID,
        ChainNetworkId: Number.parseInt(CHAIN_NETWORK_ID, 10),
        KeyDeposit: new BigNumber(KEY_DEPOSIT),
        PoolDeposit: new BigNumber(POOL_DEPOSIT),
      },
      neededStakingKeyHashes: {
        neededHashes: new Set(),
        wits: new Set(),
      },
    })
  } catch (e) {
    if (e instanceof InsufficientFunds || e instanceof NoOutputsError) throw e
    Logger.error(`shelley::createUnsignedTx:: ${(e as Error).message}`, e)
    throw new CardanoError((e as Error).message)
  }
}
