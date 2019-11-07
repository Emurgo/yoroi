// @flow

/**
  * note: the functions in this module have been borrowed from yoroi-frontend:
  * https://github.com/Emurgo/yoroi-frontend/blob/shelley/app/api/ada/
  * transactions/shelley/utxoTransactions.js
 */

import {InsufficientFunds} from '../errors'
import {BigNumber} from 'bignumber.js'
import {
  Address,
  Fee,
  FragmentId,
  Hash,
  Input,
  OutputPolicy,
  TransactionBuilder,
  TransactionFinalizer,
  UtxoPointer,
  Value,
  Witness,
} from 'react-native-chain-libs'

import type {
  V3UnsignedTransactionData,
  Addressing,
} from '../../types/HistoryTransaction'
import {CARDANO_CONFIG} from '../../config'

const CONFIG = CARDANO_CONFIG.SHELLEY

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export const newAdaUnsignedTxFromUtxo = async (
  receiver: string,
  amount: string,
  changeAddresses: Array<{| address: string, ...Addressing |}>,
  allUtxos: Array<RawUtxo>,
): Promise<V3UnsignedTransactionData> => {
  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.LINEAR_FEE.CONSTANT),
    await Value.from_str(CONFIG.LINEAR_FEE.COEFFICIENT),
    await Value.from_str(CONFIG.LINEAR_FEE.CERTIFICATE),
  )

  const txBuilder = await TransactionBuilder.new_no_payload()
  await txBuilder.add_output(
    await Address.from_string(receiver),
    await Value.from_str(amount)
  )
  const selectedUtxos = firstMatchFirstInputSelection(
    txBuilder,
    allUtxos,
    feeAlgorithm
  )
  let transaction
  const change = []
  if (changeAddresses.length === 1) {
    const changeAddress = changeAddresses[0]

    /**
     * Note: The balance of the transaction may be slightly positive.
     * This is because the fee of adding a change address
     * may be more expensive than the amount leftover
     * In this case we don't add a change address
     */
    transaction = await txBuilder.seal_with_output_policy(
      feeAlgorithm,
      await OutputPolicy.one(
        await Address.from_string(changeAddress.address)
      )
    )
    // given the change address, compute how much coin will be sent to it
    change.push(...filterToUsedChange(
      changeAddress,
      await transaction.outputs(),
      selectedUtxos
    ))
  } else {
    transaction = await txBuilder.seal_with_output_policy(
      feeAlgorithm,
      await OutputPolicy.forget()
    )
  }

  return {
    senderUtxos: selectedUtxos,
    unsignedTx: transaction,
    changeAddr: change,
  }
}

async function firstMatchFirstInputSelection(
  txBuilder: TransactionBuilder,
  allUtxos: Array<RawUtxo>,
  feeAlgorithm: Fee,
): Promise<Array<RawUtxo>> {
  const selectedOutputs = []
  if (allUtxos.length === 0) {
    throw new InsufficientFunds()
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i])
    await txBuilder.add_input(utxoToTxInput(allUtxos[i]))
    // TODO: TransactionBuilder.get_balance() is not yet implemented
    const txBalance = await txBuilder.get_balance(feeAlgorithm)
    if (!await txBalance.is_negative()) {
      break
    }
    if (i === allUtxos.length - 1) {
      throw new InsufficientFunds()
    }
  }
  return selectedOutputs
}

/**
 * WASM doesn't explicitly tell us how much Ada will be sent to the change address
 * so instead, we iterate over all outputs of a transaction
 * and figure out which one was not added by us (therefore must have been added as change)
 */
async function filterToUsedChange(
  changeAddr: {| address: string, ...Addressing |},
  outputs: Outputs,
  selectedUtxos: Array<RawUtxo>,
): Promise<Array<{| address: string, value: void | BigNumber, ...Addressing |}>> {
  // we should never have the change address also be an input
  // but we handle this edge case just in case
  const possibleDuplicates = selectedUtxos.filter((utxo) => utxo.receiver === changeAddr.address)

  const change = []
  for (let i = 0; i < await outputs.size(); i++) {
    const output = await outputs.get(i)
    // we can't know which bech32 prefix was used
    // so we instead assume the suffix must match
    const suffix = (await (await output.address()).to_string('dummy')).slice('dummy'.length)
    const val = (await (await output.value())).to_str()
    if (changeAddr.address.endsWith(suffix)) {
      const indexInInput = possibleDuplicates.findIndex(
        (utxo) => utxo.amount === val
      )
      if (indexInInput === -1) {
        change.push({
          ...changeAddr,
          value: new BigNumber(val),
        })
      }
      // remove the duplicate and keep searching
      possibleDuplicates.splice(indexInInput, 1)
    }
  }
  // note: if no element found, then no change was needed (tx was perfectly balanced)
  return change
}

// TODO
export const signTransaction = async (
  signRequest: V3UnsignedTxAddressedUtxoResponse, // TODO
  keyLevel: number,
  signingKey: RustModule.WalletV2.PrivateKey // TODO
): AuthenticatedTransaction => {
  const {senderUtxos, unsignedTx} = signRequest
  const txFinalizer = await new TransactionFinalizer(unsignedTx)
  addWitnesses(
    txFinalizer,
    senderUtxos,
    keyLevel,
    signingKey
  )
  const signedTx = await txFinalizer.finalize()
  return signedTx
}

async function utxoToTxInput(
  utxo: RawUtxo,
): Input {
  const txoPointer = await UtxoPointer.new(
    await FragmentId.from_bytes(
      Buffer.from(utxo.tx_hash, 'hex')
    ),
    utxo.tx_index,
    await Value.from_str(utxo.amount),
  )
  return Input.from_utxo(txoPointer)
}

// TODO
async function addWitnesses(
  txFinalizer: TransactionFinalizer,
  senderUtxos: Array<AddressedUtxo>,
  keyLevel: number,
  signingKey: RustModule.WalletV2.PrivateKey // TODO
): Promise<void> {
  // get private keys
  const privateKeys = senderUtxos.map((utxo) => {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error('addWitnesses incorrect addressing size')
    }
    if (keyLevel + 1 < utxo.addressing.startLevel) {
      throw new Error('addWitnesses keyLevel < startLevel')
    }
    let key = signingKey
    for (let i = keyLevel - utxo.addressing.startLevel + 1; i < utxo.addressing.path.length; i++) {
      key = key.derive(
        RustModule.WalletV2.DerivationScheme.v2(), // TODO
        utxo.addressing.path[i]
      )
    }
    return key
  })

  for (let i = 0; i < senderUtxos.length; i++) {
    const witness = Witness.for_utxo(
      await Hash.from_hex(CONFIG.GENESISHASH),
      txFinalizer.get_txid(),
      v2SkKeyToV3Key(privateKeys[i]), // TODO
    )
    txFinalizer.set_witness(i, witness)
  }
}
