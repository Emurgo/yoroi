// @flow

/**
 * note: the functions in this module have been borrowed from yoroi-frontend:
 * https://github.com/Emurgo/yoroi-frontend/blob/shelley/app/api/ada/
 * transactions/shelley/utxoTransactions.js
 *
 * Keep in mind that the types are not exactly the same wrt to yoroi-frontend
 * and other things might have changed in order to integrate the code in the
 * existing structure
 */

import {InsufficientFunds} from '../../errors'
import {BigNumber} from 'bignumber.js'
import {
  Address,
  Bip32PrivateKey,
  Fee,
  FragmentId,
  Hash,
  Input,
  InputOutputBuilder,
  OutputPolicy,
  Outputs,
  Payload,
  PayloadAuthData,
  Transaction,
  TransactionBuilder,
  TransactionBuilderSetAuthData,
  TransactionBuilderSetWitness,
  UtxoPointer,
  Value,
  Witness,
  Witnesses,
} from 'react-native-chain-libs'
import type {
  V3UnsignedTxData,
  V3UnsignedTxAddressedUtxoData,
  RawUtxo,
  AddressedUtxo,
  Addressing,
} from '../../../types/HistoryTransaction'
import {CARDANO_CONFIG} from '../../../config'

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
  changeAddresses: Array<{|address: string, ...Addressing|}>,
  allUtxos: Array<RawUtxo>,
): Promise<V3UnsignedTxData> => {
  const feeAlgorithm = await Fee.linear_fee(
    await Value.from_str(CONFIG.LINEAR_FEE.CONSTANT),
    await Value.from_str(CONFIG.LINEAR_FEE.COEFFICIENT),
    await Value.from_str(CONFIG.LINEAR_FEE.CERTIFICATE),
  )

  const ioBuilder = await InputOutputBuilder.empty()
  await ioBuilder.add_output(
    await Address.from_string(receiver),
    await Value.from_str(amount),
  )

  // can't add a certificate to a UTXO transaction
  const payload = await Payload.no_payload()

  const selectedUtxos = await firstMatchFirstInputSelection(
    ioBuilder,
    allUtxos,
    feeAlgorithm,
    payload,
  )
  let IOs
  const change = []
  if (changeAddresses.length === 1) {
    const changeAddress = changeAddresses[0]

    /**
     * Note: The balance of the transaction may be slightly positive.
     * This is because the fee of adding a change address
     * may be more expensive than the amount leftover
     * In this case we don't add a change address
     */
    IOs = await ioBuilder.seal_with_output_policy(
      payload,
      feeAlgorithm,
      await OutputPolicy.one(await Address.from_string(changeAddress.address)),
    )
    // given the change address, compute how much coin will be sent to it
    change.push(
      ...(await filterToUsedChange(
        changeAddress,
        await IOs.outputs(),
        selectedUtxos,
      )),
    )
  } else if (changeAddresses.length === 0) {
    IOs = await ioBuilder.seal_with_output_policy(
      payload,
      feeAlgorithm,
      await OutputPolicy.forget(),
    )
  } else {
    throw new Error('only support single change address')
  }

  return {
    senderUtxos: selectedUtxos,
    IOs,
    changeAddr: change,
  }
}

export const newAdaUnsignedTx = async (
  receiver: string,
  amount: string,
  changeAdaAddr: Array<{|address: string, ...Addressing|}>,
  allUtxos: Array<AddressedUtxo>,
): Promise<V3UnsignedTxAddressedUtxoData> => {
  const addressingMap = new Map<RawUtxo, AddressedUtxo>()
  for (const utxo of allUtxos) {
    addressingMap.set(
      {
        amount: utxo.amount,
        receiver: utxo.receiver,
        tx_hash: utxo.tx_hash,
        tx_index: utxo.tx_index,
        utxo_id: utxo.utxo_id,
      },
      utxo,
    )
  }
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
    receiver,
    amount,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
  )

  const addressedUtxos = unsignedTxResponse.senderUtxos.map((utxo) => {
    const addressedUtxo = addressingMap.get(utxo)
    if (addressedUtxo == null) {
      throw new Error(
        'newAdaUnsignedTx utxo reference was changed. Should not happen',
      )
    }
    return addressedUtxo
  })

  return {
    senderUtxos: addressedUtxos,
    IOs: unsignedTxResponse.IOs,
    changeAddr: unsignedTxResponse.changeAddr,
  }
}

async function firstMatchFirstInputSelection(
  txBuilder: InputOutputBuilder,
  allUtxos: Array<RawUtxo>,
  feeAlgorithm: Fee,
  payload: Payload,
): Promise<Array<RawUtxo>> {
  const selectedOutputs = []
  if (allUtxos.length === 0) {
    throw new InsufficientFunds()
  }
  // add UTXOs in whatever order they're sorted until we have enough for amount+fee
  for (let i = 0; i < allUtxos.length; i++) {
    selectedOutputs.push(allUtxos[i])
    await txBuilder.add_input(await utxoToTxInput(allUtxos[i]))
    const txBalance = await txBuilder.get_balance(payload, feeAlgorithm)
    if (!(await txBalance.is_negative())) {
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
  changeAddr: {|address: string, ...Addressing|},
  outputs: Outputs,
  selectedUtxos: Array<RawUtxo>,
): Promise<Array<{|address: string, value: void | BigNumber, ...Addressing|}>> {
  // we should never have the change address also be an input
  // but we handle this edge case just in case
  const possibleDuplicates = selectedUtxos.filter(
    (utxo) => utxo.receiver === changeAddr.address,
  )

  const change = []
  for (let i = 0; i < (await outputs.size()); i++) {
    const output = await outputs.get(i)
    // we can't know which bech32 prefix was used
    // so we instead assume the suffix must match
    const suffix = (await (await output.address()).to_string('dummy')).slice(
      'dummy'.length,
    )
    const val = (await await output.value()).to_str()
    if (changeAddr.address.endsWith(suffix)) {
      const indexInInput = possibleDuplicates.findIndex(
        (utxo) => utxo.amount === val,
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

export const signTransaction = async (
  signRequest: V3UnsignedTxAddressedUtxoData,
  signingKey: Bip32PrivateKey,
  useLegacy: boolean,
): Promise<Transaction> => {
  const {senderUtxos, IOs} = signRequest

  const txBuilder = await new TransactionBuilder()
  const builderSetIOs = await txBuilder.no_payload()
  const builderSetWitnesses = await builderSetIOs.set_ios(
    await IOs.inputs(),
    await IOs.outputs(),
  )
  const builderSetAuthData = await addWitnesses(
    builderSetWitnesses,
    senderUtxos,
    signingKey,
    useLegacy,
  )

  const signedTx = await builderSetAuthData.set_payload_auth(
    // can't add a certificate to a UTXO transaction
    await PayloadAuthData.for_no_payload(),
  )
  return signedTx
}

async function utxoToTxInput(utxo: RawUtxo): Input {
  const txoPointer = await UtxoPointer.new(
    await FragmentId.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
    utxo.tx_index,
    await Value.from_str(utxo.amount),
  )
  return await Input.from_utxo(txoPointer)
}

/**
 * In contrast to yoroi-frontend, this function still uses the old addressing
 * format only compatible with with Bip44 paths.
 */
async function addWitnesses(
  builderSetWitnesses: TransactionBuilderSetWitness,
  senderUtxos: Array<AddressedUtxo>,
  signingKey: Bip32PrivateKey,
  useLegacy: boolean,
): Promise<TransactionBuilderSetAuthData> {
  // get private keys
  const privateKeys = await Promise.all(
    senderUtxos.map(
      async (utxo): Promise<Bip32PrivateKey> => {
        const chainKey = await signingKey.derive(utxo.addressing.chain)
        const addressKey = await chainKey.derive(utxo.addressing.index)
        return addressKey
      },
    ),
  )

  const witnesses = await Witnesses.new()
  for (let i = 0; i < senderUtxos.length; i++) {
    let witness
    if (useLegacy) {
      witness = await Witness.for_legacy_icarus_utxo(
        await Hash.from_hex(CONFIG.GENESISHASH),
        await builderSetWitnesses.get_auth_data_for_witness(),
        privateKeys[i],
      )
    } else {
      await Witness.for_utxo(
        await Hash.from_hex(CONFIG.GENESISHASH),
        await builderSetWitnesses.get_auth_data_for_witness(),
        await privateKeys[i].to_raw_key(),
      )
    }
    witnesses.add(witness)
  }
  return await builderSetWitnesses.set_witnesses(witnesses)
}
