// @flow

// Handles interfacing w/ cardano-serialization-lib to create transaction
// Note: All this code was taken from the Yoroi Extension and adapted for
// compatibility with Yoroi mobile's types and async operation

import {BigNumber} from 'bignumber.js'
/* eslint-disable camelcase */
import {
  BigNum,
  Bip32PrivateKey,
  BootstrapWitnesses,
  ByronAddress,
  Certificate,
  Certificates,
  LinearFee,
  hash_transaction,
  make_icarus_bootstrap_witness,
  make_vkey_witness,
  RewardAddress,
  Transaction,
  TransactionBody,
  TransactionBuilder,
  TransactionHash,
  TransactionInput,
  TransactionMetadata,
  TransactionOutput,
  TransactionWitnessSet,
  Vkeywitness,
  Vkeywitnesses,
  Withdrawals,
} from 'react-native-haskell-shelley'
/* eslint-enable camelcase */
import {CONFIG} from '../../config/config'
import {InsufficientFunds, NoOutputsError} from '../errors'
import {
  getCardanoAddrKeyHash,
  normalizeToAddress,
  derivePrivateByAddressing,
} from './utils'

import type {
  Address,
  Addressing,
  BaseSignRequest,
  V4UnsignedTxUtxoResponse,
  V4UnsignedTxAddressedUtxoResponse,
  AddressedUtxo,
  TxOutput,
} from '../types'
import type {RawUtxo} from '../../api/types'

/**
 * based off what the cardano-wallet team found worked empirically
 * note: slots are 1 second in Shelley mainnet, so this is 2 minutes
 */
const defaultTtlOffset = 7200

export const sendAllUnsignedTxFromUtxo = async (
  receiver: string,
  allUtxos: Array<RawUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
  |},
): Promise<V4UnsignedTxUtxoResponse> => {
  const totalBalance = allUtxos
    .map((utxo) => new BigNumber(utxo.amount))
    .reduce((acc, amount) => acc.plus(amount), new BigNumber(0))
  if (totalBalance.isZero()) {
    throw new InsufficientFunds()
  }

  const txBuilder = await TransactionBuilder.new(
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  )
  await txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber())
  for (const input of allUtxos) {
    await addUtxoInput(txBuilder, input)
  }

  if (totalBalance.lt(await (await txBuilder.min_fee()).to_str())) {
    // not enough in inputs to even cover the cost of including themselves in a tx
    throw new InsufficientFunds()
  }
  {
    const wasmReceiver = await normalizeToAddress(receiver)
    if (wasmReceiver == null) {
      throw new Error(
        'sendAllUnsignedTxFromUtxo receiver not a valid Shelley address',
      )
    }

    // semantically, sending all ADA to somebody
    // is the same as if you're sending all the ADA as change to yourself
    // (module the fact the address doesn't belong to you)
    const couldSendAmount = await txBuilder.add_change_if_needed(wasmReceiver)
    if (!couldSendAmount) {
      // if you couldn't send any amount,
      // it's because you couldn't cover the fee of adding an output
      throw new InsufficientFunds()
    }
  }

  return {
    senderUtxos: allUtxos,
    txBuilder,
    changeAddr: [], // no change for sendAll
  }
}

export const sendAllUnsignedTx = async (
  receiver: string,
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
  |},
): Promise<V4UnsignedTxAddressedUtxoResponse> => {
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
  const unsignedTxResponse = await sendAllUnsignedTxFromUtxo(
    receiver,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
  )

  const addressedUtxos = unsignedTxResponse.senderUtxos.map((utxo) => {
    const addressedUtxo = addressingMap.get(utxo)
    if (addressedUtxo == null) {
      throw new Error(
        'sendAllUnsignedTx:: utxo reference was changed. Should not happen',
      )
    }
    return addressedUtxo
  })

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates: [],
  }
}

async function addUtxoInput(
  txBuilder: TransactionBuilder,
  input: RawUtxo,
): Promise<void> {
  const wasmInput = await normalizeToAddress(input.receiver)
  if (wasmInput == null) {
    throw new Error('addUtxoInput:: input not a valid Shelley address')
  }
  const keyHash = await getCardanoAddrKeyHash(wasmInput)
  if (keyHash === null) {
    const byronAddr = await ByronAddress.from_address(wasmInput)
    if (byronAddr == null) {
      throw new Error(
        'addUtxoInput:: should never happen: non-byron address without key hash',
      )
    }
    await txBuilder.add_bootstrap_input(
      byronAddr,
      await utxoToTxInput(input),
      await BigNum.from_str(input.amount),
    )
    return
  }
  if (keyHash === undefined) {
    throw new Error('addUtxoInput:: script inputs not expected')
  }
  await txBuilder.add_key_input(
    keyHash,
    await utxoToTxInput(input),
    await BigNum.from_str(input.amount),
  )
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export const newAdaUnsignedTxFromUtxo = async (
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {|...Address, ...Addressing|},
  utxos: Array<RawUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
  |},
  certificates: $ReadOnlyArray<Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RewardAddress,
    amount: BigNum,
  |}>,
  allowNoOutputs: boolean,
): Promise<V4UnsignedTxUtxoResponse> => {
  /**
   * Shelley supports transactions with no outputs by simply burning any leftover ADA as fee
   * This is can happen in the following:
   * - if you have a 3ADA UTXO and you register a staking key, there will be 0 outputs
   * However, if there is no output, there is no way to tell the network of the transaction
   * This allows for replay attacks of 0-output transactions on testnets that use a mainnet snapshot
   * To protect against this, we can choose to force that there is always even one output
   * by simply enforcing a change address if no outputs are specified for the transaction
   * This is actually enforced by hardware wallets at the moment (will error on 0 outputs)
   */
  const shouldForceChange = !allowNoOutputs && outputs.length === 0
  if (shouldForceChange && changeAdaAddr == null) {
    throw new NoOutputsError()
  }

  const txBuilder = await TransactionBuilder.new(
    protocolParams.linearFee,
    protocolParams.minimumUtxoVal,
    protocolParams.poolDeposit,
    protocolParams.keyDeposit,
  )
  if (certificates.length > 0) {
    const certsNative = await Certificates.new()
    for (const cert of certificates) {
      await certsNative.add(cert)
    }
    await txBuilder.set_certs(certsNative)
  }
  if (withdrawals.length > 0) {
    const withdrawalsNative = await Withdrawals.new()
    for (const withdrawal of withdrawals) {
      await withdrawalsNative.insert(withdrawal.address, withdrawal.amount)
    }
    await txBuilder.set_withdrawals(withdrawalsNative)
  }
  await txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber())

  {
    for (const output of outputs) {
      const wasmReceiver = await normalizeToAddress(output.address)
      if (wasmReceiver == null) {
        throw new Error(
          'newAdaUnsignedTxFromUtxo:: receiver not a valid Shelley address',
        )
      }
      await txBuilder.add_output(
        await TransactionOutput.new(
          wasmReceiver,
          await BigNum.from_str(output.amount),
        ),
      )
    }
  }

  // pick inputs
  const usedUtxos: Array<RawUtxo> = []
  {
    // recall: we might have some implicit input to start with from deposit refunds
    let currentInputSum = new BigNumber(
      await (await txBuilder.get_explicit_input()).to_str(),
    )
    if (utxos.length === 0) {
      throw new InsufficientFunds()
    }
    // add utxos until we have enough to send the transaction
    for (const utxo of utxos) {
      usedUtxos.push(utxo) // note: this ensure we have at least one UTXO in the tx
      currentInputSum = currentInputSum.plus(utxo.amount)
      await addUtxoInput(txBuilder, utxo)
      // need to recalculate each time because fee changes
      const output = new BigNumber(
        await (
          await (
            await (await txBuilder.get_explicit_output()).checked_add(
              await txBuilder.min_fee(),
            )
          ).checked_add(await txBuilder.get_deposit())
        ).to_str(),
      )

      if (shouldForceChange) {
        if (changeAdaAddr == null) throw new NoOutputsError()
        const minimumNeededForChange = await getFeeForChange(
          txBuilder,
          changeAdaAddr,
          protocolParams,
        )
        if (currentInputSum.gte(minimumNeededForChange.plus(output))) {
          break
        }
      }
      if (!shouldForceChange && currentInputSum.gte(output)) {
        break
      }
    }
    // check to see if we have enough balance in the wallet to cover the transaction
    {
      const output = new BigNumber(
        await (
          await (
            await (await txBuilder.get_explicit_output()).checked_add(
              await txBuilder.min_fee(),
            )
          ).checked_add(await txBuilder.get_deposit())
        ).to_str(),
      )
      if (shouldForceChange) {
        if (changeAdaAddr == null) throw new NoOutputsError()
        const minimumNeededForChange = await getFeeForChange(
          txBuilder,
          changeAdaAddr,
          protocolParams,
        )
        if (currentInputSum.lt(minimumNeededForChange.plus(output))) {
          throw new InsufficientFunds()
        }
      }
      if (!shouldForceChange && currentInputSum.lt(output)) {
        throw new InsufficientFunds()
      }
    }
  }

  const changeAddr = await (async () => {
    if (changeAdaAddr == null) {
      if (shouldForceChange) {
        throw new NoOutputsError()
      }
      const totalInput = await (
        await txBuilder.get_explicit_input()
      ).checked_add(await txBuilder.get_implicit_input())
      const totalOutput = await txBuilder.get_explicit_output()
      const deposit = await txBuilder.get_deposit()
      const difference = new BigNumber(
        await (
          await (await totalInput.checked_sub(totalOutput)).checked_sub(deposit)
        ).to_str(),
      )
      const minFee = new BigNumber(await (await txBuilder.min_fee()).to_str())
      if (difference.lt(minFee)) {
        throw new InsufficientFunds()
      }
      // recall: min fee assumes the largest fee possible
      // so no worries of cbor issue by including larger fee
      await txBuilder.set_fee(await BigNum.from_str(difference.toString()))
      return []
    }
    const oldOutput = await txBuilder.get_explicit_output()

    const wasmChange = await normalizeToAddress(changeAdaAddr.address)
    if (wasmChange == null) {
      throw new Error(
        'newAdaUnsignedTxFromUtxo:: change not a valid Shelley address',
      )
    }
    const changeWasAdded = await txBuilder.add_change_if_needed(wasmChange)
    const changeValue = new BigNumber(
      await (
        await (await txBuilder.get_explicit_output()).checked_sub(oldOutput)
      ).to_str(),
    )
    // prettier-ignore
    return changeWasAdded
      ? [{
        ...changeAdaAddr,
        value: changeValue,
      }]
      : []
  })()

  return {
    senderUtxos: usedUtxos,
    txBuilder,
    changeAddr,
  }
}

/**
 * we use all UTXOs as possible inputs for selection
 */
export const newAdaUnsignedTx = async (
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {|...Address, ...Addressing|},
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
    poolDeposit: BigNum,
    keyDeposit: BigNum,
  |},
  certificates: $ReadOnlyArray<Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RewardAddress,
    amount: BigNum,
  |}>,
  allowNoOutputs: boolean,
): Promise<V4UnsignedTxAddressedUtxoResponse> => {
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
    outputs,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
    certificates,
    withdrawals,
    allowNoOutputs,
  )

  const addressedUtxos = unsignedTxResponse.senderUtxos.map((utxo) => {
    const addressedUtxo = addressingMap.get(utxo)
    if (addressedUtxo == null) {
      throw new Error(
        'newAdaUnsignedTx:: utxo reference was changed. Should not happen',
      )
    }
    return addressedUtxo
  })

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates,
  }
}

// return the minimum amount of input ADA required to generate an output
async function getFeeForChange(
  txBuilder: TransactionBuilder,
  changeAdaAddr: {|...Address, ...Addressing|},
  protocolParams: {
    linearFee: LinearFee,
    minimumUtxoVal: BigNum,
  },
): Promise<BigNumber> {
  if (changeAdaAddr == null) throw new NoOutputsError()
  const wasmChange = await normalizeToAddress(changeAdaAddr.address)
  if (wasmChange == null) {
    throw new Error(
      'transactions::getFeeForChange: change not a valid Shelley address',
    )
  }
  const feeForChange = await (
    await txBuilder.fee_for_output(
      await TransactionOutput.new(
        wasmChange,
        // largest possible CBOR value
        // note: this slightly over-estimates by a few bytes
        await BigNum.from_str((0x100000000).toString()),
      ),
    )
  ).to_str()
  const minimumNeededForChange = new BigNumber(feeForChange).plus(
    await protocolParams.minimumUtxoVal.to_str(),
  )
  return minimumNeededForChange
}

export const signTransaction = async (
  signRequest:
    | BaseSignRequest<TransactionBuilder>
    | BaseSignRequest<TransactionBody>,
  keyLevel: number,
  signingKey: Bip32PrivateKey,
  stakingKeyWits: Set<string>,
  metadata: void | TransactionMetadata,
): Promise<Transaction> => {
  const seenByronKeys: Set<string> = new Set()
  const seenKeyHashes: Set<string> = new Set()
  const deduped: Array<AddressedUtxo> = []
  for (const senderUtxo of signRequest.senderUtxos) {
    const wasmAddr = await normalizeToAddress(senderUtxo.receiver)
    if (wasmAddr == null) {
      throw new Error('signTransaction:: utxo not a valid Shelley address')
    }
    const keyHash = await getCardanoAddrKeyHash(wasmAddr)
    const addrHex = Buffer.from(await wasmAddr.to_bytes()).toString('hex')
    if (keyHash === null) {
      if (!seenByronKeys.has(addrHex)) {
        seenByronKeys.add(addrHex)
        deduped.push(senderUtxo)
      }
      continue
    }
    if (keyHash === undefined) {
      throw new Error('signTransaction:: cannot sign script inputs')
    }
    {
      const keyHex = Buffer.from(await keyHash.to_bytes()).toString('hex')
      if (!seenKeyHashes.has(keyHex)) {
        seenKeyHashes.add(keyHex)
        deduped.push(senderUtxo)
      }
    }
  }

  const txBody =
    signRequest.unsignedTx instanceof TransactionBuilder
      ? await signRequest.unsignedTx.build()
      : signRequest.unsignedTx
  const txHash = await hash_transaction(txBody)

  const vkeyWits = await Vkeywitnesses.new()
  const bootstrapWits = await BootstrapWitnesses.new()

  await addWitnesses(
    txHash,
    deduped,
    keyLevel,
    signingKey,
    vkeyWits,
    bootstrapWits,
  )

  const stakingKeySigSet = new Set<string>()
  for (const witness of stakingKeyWits) {
    if (stakingKeySigSet.has(witness)) {
      continue
    }
    stakingKeySigSet.add(witness)
    await vkeyWits.add(
      await Vkeywitness.from_bytes(Buffer.from(witness, 'hex')),
    )
  }

  const witnessSet = await TransactionWitnessSet.new()
  if ((await bootstrapWits.len()) > 0) {
    await witnessSet.set_bootstraps(bootstrapWits)
  }
  if ((await vkeyWits.len()) > 0) await witnessSet.set_vkeys(vkeyWits)

  return await Transaction.new(txBody, witnessSet, metadata)
}

async function utxoToTxInput(utxo: RawUtxo): TransactionInput {
  return await TransactionInput.new(
    await TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
    utxo.tx_index,
  )
}

async function addWitnesses(
  txHash: TransactionHash,
  uniqueUtxos: Array<AddressedUtxo>, // pre-req: does not contain duplicate keys
  keyLevel: number,
  signingKey: Bip32PrivateKey,
  vkeyWits: Vkeywitnesses,
  bootstrapWits: BootstrapWitnesses,
): Promise<void> {
  // get private keys
  const privateKeys = await Promise.all(
    uniqueUtxos.map(async (utxo): Promise<Bip32PrivateKey> => {
      const lastLevelSpecified =
        utxo.addressing.startLevel + utxo.addressing.path.length - 1
      if (
        lastLevelSpecified !== CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ADDRESS
      ) {
        throw new Error('addWitnesses:: incorrect addressing size')
      }
      return await derivePrivateByAddressing({
        addressing: utxo.addressing,
        startingFrom: {
          level: keyLevel,
          key: signingKey,
        },
      })
    }),
  )

  // sign the transaction
  for (let i = 0; i < uniqueUtxos.length; i++) {
    const wasmAddr = await normalizeToAddress(uniqueUtxos[i].receiver)
    if (wasmAddr == null) {
      throw new Error('addWitnesses: utxo not a valid Shelley address')
    }
    const byronAddr = await ByronAddress.from_address(wasmAddr)
    if (byronAddr == null) {
      const vkeyWit = await make_vkey_witness(
        txHash,
        await privateKeys[i].to_raw_key(),
      )
      await vkeyWits.add(vkeyWit)
    } else {
      const bootstrapWit = await make_icarus_bootstrap_witness(
        txHash,
        byronAddr,
        privateKeys[i],
      )
      await bootstrapWits.add(bootstrapWit)
    }
  }
}
