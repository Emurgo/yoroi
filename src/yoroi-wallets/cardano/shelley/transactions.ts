/* eslint-disable @typescript-eslint/no-explicit-any */

import {BigNumber} from 'bignumber.js'

import {CONFIG} from '../../../legacy/config'
import {AssetOverflowError, InsufficientFunds, NoOutputsError} from '../../../legacy/errors'
import type {RawUtxo} from '../../../legacy/types'
import type {
  Address,
  AddressedUtxo,
  Addressing,
  ProtocolParameters,
  TxOutput,
  V4UnsignedTxAddressedUtxoResponse,
  V4UnsignedTxUtxoResponse,
} from '../../../legacy/types'
import {
  cardanoValueFromMultiToken,
  cardanoValueFromRemoteFormat,
  derivePrivateByAddressing,
  getCardanoAddrKeyHash,
  multiTokenFromCardanoValue,
  normalizeToAddress,
} from '../../../legacy/utils'
import {} from '../../index'
import {
  BigNum,
  BootstrapWitnesses,
  ByronAddress,
  CardanoTypes,
  Certificates,
  hashTransaction,
  makeIcarusBootstrapWitness,
  makeVkeyWitness,
  minAdaRequired,
  MultiAsset,
  Transaction,
  TransactionBuilder,
  // TransactionBuilder,
  TransactionHash,
  TransactionInput,
  TransactionOutput,
  TransactionWitnessSet,
  Value,
  Vkeywitness,
  Vkeywitnesses,
  Withdrawals,
} from '..'

const AddInputResult = Object.freeze({
  VALID: 0,
  // not worth the fee of adding it to input
  TOO_SMALL: 1,
  // token would overflow if added
  OVERFLOW: 2,
  // doesn't contribute to target
  NO_NEED: 3,
})
const PRIMARY_ASSET_CONSTANTS = CONFIG.PRIMARY_ASSET_CONSTANTS

/**
 * based off what the cardano-wallet team found worked empirically
 * note: slots are 1 second in Shelley mainnet, so this is 2 minutes
 */
const defaultTtlOffset = 7200
export const sendAllUnsignedTxFromUtxo = async (
  receiver: Address & Partial<Addressing>,
  allUtxos: Array<RawUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: ProtocolParameters,
  auxiliaryData?: CardanoTypes.AuxiliaryData,
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
  await txBuilder.setTtl(absSlotNumber.plus(defaultTtlOffset).toNumber())

  for (const input of allUtxos) {
    if (
      (await addUtxoInput(txBuilder, undefined, input, false, {
        networkId: protocolParams.networkId,
      })) === AddInputResult.OVERFLOW
    ) {
      // for the send all case, prefer to throw an error
      // instead of skipping inputs that would cause an error
      // otherwise leads to unexpected cases like wallet migration leaving some UTXO behind
      throw new AssetOverflowError()
    }
  }

  if (auxiliaryData !== undefined) {
    await txBuilder.setAuxiliaryData(auxiliaryData)
  }

  if (totalBalance.lt(await (await txBuilder.minFee()).toStr())) {
    // not enough in inputs to even cover the cost of including themselves in a tx
    throw new InsufficientFunds()
  }

  {
    const wasmReceiver = await normalizeToAddress(receiver.address)

    if (wasmReceiver == null) {
      throw new Error('sendAllUnsignedTxFromUtxo receiver not a valid Shelley address')
    }

    // semantically, sending all ADA to somebody
    // is the same as if you're sending all the ADA as change to yourself
    // (module the fact the address doesn't belong to you)
    const couldSendAmount = await txBuilder.addChangeIfNeeded(wasmReceiver)

    if (!couldSendAmount) {
      // if you couldn't send any amount,
      // it's because you couldn't cover the fee of adding an output
      throw new InsufficientFunds()
    }
  }
  const changeAddr = await (async () => {
    if (receiver.addressing == null) return []
    const {addressing} = receiver
    return [
      {
        addressing,
        address: receiver.address,
        values: await multiTokenFromCardanoValue(await txBuilder.getExplicitOutput(), {
          defaultNetworkId: protocolParams.networkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
        }),
      },
    ]
  })()
  return {
    senderUtxos: allUtxos,
    txBuilder,
    changeAddr,
  }
}
export const sendAllUnsignedTx = async (
  receiver: Address & Partial<Addressing>,
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: ProtocolParameters,
  auxiliaryData?: CardanoTypes.AuxiliaryData,
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
        assets: utxo.assets,
      },
      utxo,
    )
  }

  const unsignedTxResponse = await sendAllUnsignedTxFromUtxo(
    receiver,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
    auxiliaryData,
  )
  const addressedUtxos = unsignedTxResponse.senderUtxos.map((utxo) => {
    const addressedUtxo = addressingMap.get(utxo)

    if (addressedUtxo == null) {
      throw new Error('sendAllUnsignedTx:: utxo reference was changed. Should not happen')
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
  txBuilder: CardanoTypes.TransactionBuilder,
  remaining: void | {
    hasInput: boolean
    // every tx requires at least one input
    value: CardanoTypes.Value
  },
  input: RawUtxo,
  /* don't add the input if the amount is smaller than the fee to add it to the tx */
  excludeIfSmall: boolean,
  protocolParams: {
    networkId: number
  },
): Promise<typeof AddInputResult[keyof typeof AddInputResult]> {
  const wasmAddr = await normalizeToAddress(input.receiver)

  if (wasmAddr == null) {
    throw new Error('addUtxoInput:: input not a valid Shelley address')
  }

  const txInput = await utxoToTxInput(input)
  const wasmAmount = await cardanoValueFromRemoteFormat(input)

  const skipOverflow: (arg0: void) => Promise<typeof AddInputResult[keyof typeof AddInputResult]> = async () => {
    /**
     * UTXOs can only contain at most u64 of a value
     * so if the sum of UTXO inputs for a tx > u64
     * it can cause the tx to fail (due to overflow) in the output / change
     *
     * This can be addressed by splitting up a tx to use multiple outputs / multiple change
     * and this just requires more ADA to cover the min UTXO of these added inputs
     * but as a simple solution for now, we just block > u64 inputs of any token
     * This isn't a great workaround since it means features like sendAll may end up not sending all
     */
    const currentInputSum = await (await txBuilder.getExplicitInput()).checkedAdd(await txBuilder.getImplicitInput())

    try {
      await currentInputSum.checkedAdd(wasmAmount)
    } catch (e) {
      return AddInputResult.OVERFLOW
    }

    return AddInputResult.VALID
  }

  const skipInput: (arg0: void) => Promise<typeof AddInputResult[keyof typeof AddInputResult]> = async () => {
    if (remaining == null) return await skipOverflow()
    const defaultEntry = {
      defaultNetworkId: protocolParams.networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
    }
    const tokenSetInInput = new Set(input.assets.map((asset) => asset.assetId))
    const remainingTokens = await multiTokenFromCardanoValue(remaining.value, defaultEntry)
    const includedTargets = remainingTokens.nonDefaultEntries().filter((entry) => tokenSetInInput.has(entry.identifier))

    if (remainingTokens.getDefaultEntry().amount.gt(0) && new BigNumber(input.amount).gt(0)) {
      includedTargets.push(remainingTokens.getDefaultEntry())
    }

    // it's possible to have no target left and yet have no input added yet
    // due to refunds in Cardano
    // so we still want to add the input in this case even if we don't care about the coins in it
    if (includedTargets.length === 0 && remaining.hasInput) {
      return AddInputResult.NO_NEED
    }

    const onlyDefaultEntry =
      includedTargets.length === 1 && includedTargets[0].identifier === defaultEntry.defaultIdentifier

    // ignore UTXO that contribute less than their fee if they also don't contribute a token
    if (onlyDefaultEntry && excludeIfSmall) {
      const feeForInput = new BigNumber(await (await txBuilder.feeForInput(wasmAddr, txInput, wasmAmount)).toStr())

      if (feeForInput.gt(input.amount)) {
        return AddInputResult.TOO_SMALL
      }
    }

    return await skipOverflow()
  }

  const skipResult = await skipInput()

  if (skipResult !== AddInputResult.VALID) {
    return skipResult
  }

  await txBuilder.addInput(wasmAddr, txInput, wasmAmount)
  return AddInputResult.VALID
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export const newAdaUnsignedTxFromUtxo = async (
  outputs: Array<TxOutput>,
  changeAdaAddr: void | (Address & Addressing),
  utxos: Array<RawUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: ProtocolParameters,
  certificates: ReadonlyArray<CardanoTypes.Certificate>,
  withdrawals: ReadonlyArray<{
    address: CardanoTypes.RewardAddress
    amount: CardanoTypes.BigNum
  }>,
  allowNoOutputs: boolean,
  auxiliaryData?: CardanoTypes.AuxiliaryData,
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
   *
   * Additionally, it's not possible to burn tokens as fees at the moment
   * but this functionality may come at a later date
   */
  const shouldForceChange = async (assetsForChange: CardanoTypes.MultiAsset | void): Promise<boolean> => {
    const noOutputDisallowed = !allowNoOutputs && outputs.length === 0

    if (noOutputDisallowed && changeAdaAddr == null) {
      throw new NoOutputsError()
    }

    if (assetsForChange != null && (await assetsForChange.len()) > 0) {
      return true
    }

    return noOutputDisallowed
  }

  const emptyAsset = await MultiAsset.new()
  await shouldForceChange(undefined)
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

    await txBuilder.setCerts(certsNative)
  }

  if (auxiliaryData !== undefined) {
    await txBuilder.setAuxiliaryData(auxiliaryData)
  }

  if (withdrawals.length > 0) {
    const withdrawalsNative = await Withdrawals.new()

    for (const withdrawal of withdrawals) {
      await withdrawalsNative.insert(withdrawal.address, withdrawal.amount)
    }

    await txBuilder.setWithdrawals(withdrawalsNative)
  }

  await txBuilder.setTtl(absSlotNumber.plus(defaultTtlOffset).toNumber())
  {
    for (const output of outputs) {
      const wasmReceiver = await normalizeToAddress(output.address)

      if (wasmReceiver == null) {
        throw new Error('newAdaUnsignedTxFromUtxo:: receiver not a valid Shelley address')
      }

      await txBuilder.addOutput(
        await TransactionOutput.new(wasmReceiver, await cardanoValueFromMultiToken(output.amount)),
      )
    }
  }
  // output excluding fee
  const targetOutput = await (
    await txBuilder.getExplicitOutput()
  ).checkedAdd(await Value.new(await txBuilder.getDeposit()))
  // pick inputs
  const usedUtxos: Array<RawUtxo> = []
  {
    // recall: we might have some implicit input to start with from deposit refunds
    const implicitSum = await txBuilder.getImplicitInput()

    // add utxos until we have enough to send the transaction
    for (const utxo of utxos) {
      const currentInputSum = await (await txBuilder.getExplicitInput()).checkedAdd(implicitSum)
      const output = await targetOutput.checkedAdd(await Value.new(await txBuilder.minFee()))
      const remainingNeeded = await output.clampedSub(currentInputSum)

      // update amount required to make sure we have ADA required for change UTXO entry
      const multiAsset = await currentInputSum.multiasset()
      const _assetsForChange =
        multiAsset != null ? await multiAsset.sub((await output.multiasset()) ?? emptyAsset) : undefined

      if (await shouldForceChange(_assetsForChange)) {
        if (changeAdaAddr == null) throw new NoOutputsError()
        const difference = await currentInputSum.clampedSub(output)
        const minimumNeededForChange = await minRequiredForChange(txBuilder, changeAdaAddr, difference, protocolParams)
        const adaNeededLeftForChange = await minimumNeededForChange.clampedSub(await difference.coin())

        if ((await (await remainingNeeded.coin()).compare(adaNeededLeftForChange)) < 0) {
          await remainingNeeded.setCoin(adaNeededLeftForChange)
        }
      }

      // stop if we've added all the assets we needed
      {
        const remainingAssets = await remainingNeeded.multiasset()

        if (
          (await (await remainingNeeded.coin()).compare(await BigNum.fromStr('0'))) === 0 &&
          (remainingAssets == null || (await remainingAssets.len()) === 0) &&
          usedUtxos.length > 0
        ) {
          break
        }
      }
      const added = await addUtxoInput(
        txBuilder,
        {
          value: remainingNeeded,
          hasInput: usedUtxos.length > 0,
        },
        utxo,
        true,
        {
          networkId: protocolParams.networkId,
        },
      )
      if (added !== AddInputResult.VALID) continue
      usedUtxos.push(utxo)
    }

    // check to see if we have enough balance in the wallet to cover the transaction
    {
      const currentInputSum = await (await txBuilder.getExplicitInput()).checkedAdd(implicitSum)
      // need to recalculate each time because fee changes
      const output = await targetOutput.checkedAdd(await Value.new(await txBuilder.minFee()))
      const compare = await currentInputSum.compare(output)
      const enoughInput = compare != null && compare >= 0

      const multiAsset = await currentInputSum.multiasset()
      const _assetsForChange =
        multiAsset != null ? await multiAsset.sub((await output.multiasset()) ?? emptyAsset) : undefined

      const forceChange = await shouldForceChange(_assetsForChange)

      if (forceChange) {
        if (changeAdaAddr == null) throw new NoOutputsError()

        if (!enoughInput) {
          throw new InsufficientFunds()
        }

        const difference = await currentInputSum.checkedSub(output)
        const minimumNeededForChange = await minRequiredForChange(txBuilder, changeAdaAddr, difference, protocolParams)

        if ((await (await difference.coin()).compare(minimumNeededForChange)) < 0) {
          throw new InsufficientFunds()
        }
      }

      if (!forceChange && !enoughInput) {
        throw new InsufficientFunds()
      }
    }
  }
  const changeAddr = await (async () => {
    const totalInput = await (await txBuilder.getExplicitInput()).checkedAdd(await txBuilder.getImplicitInput())
    const difference = await totalInput.checkedSub(targetOutput)
    const forceChange = await shouldForceChange((await difference.multiasset()) ?? emptyAsset)

    if (changeAdaAddr == null) {
      if (forceChange) {
        throw new NoOutputsError()
      }

      const minFee = await txBuilder.minFee()

      if ((await (await difference.coin()).compare(minFee)) < 0) {
        throw new InsufficientFunds()
      }

      // recall: min fee assumes the largest fee possible
      // so no worries of cbor issue by including larger fee
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await txBuilder.setFee(await BigNum.fromStr(((await difference.coin()) as any).toStr()))
      return []
    }

    const outputBeforeChange = await txBuilder.getExplicitOutput()
    const wasmChange = await normalizeToAddress(changeAdaAddr.address)

    if (wasmChange == null) {
      throw new Error('newAdaUnsignedTxFromUtxo:: change not a valid Shelley address')
    }

    const changeWasAdded = await txBuilder.addChangeIfNeeded(wasmChange)

    if (forceChange && !changeWasAdded) {
      // note: this should never happened since it should have been handled by earlier code
      throw new Error('No change added even though it should be forced')
    }

    const output = await multiTokenFromCardanoValue(
      // since the change is added as an output
      // the amount of change is the new output minus what the output was before we added the change
      await (await txBuilder.getExplicitOutput()).checkedSub(outputBeforeChange),
      {
        defaultNetworkId: protocolParams.networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.CARDANO,
      },
    )
    return changeWasAdded ? [{...changeAdaAddr, values: output}] : []
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
  changeAdaAddr: void | (Address & Addressing),
  allUtxos: Array<AddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {
    linearFee: CardanoTypes.LinearFee
    minimumUtxoVal: CardanoTypes.BigNum
    poolDeposit: CardanoTypes.BigNum
    keyDeposit: CardanoTypes.BigNum
    networkId: number
  },
  certificates: ReadonlyArray<CardanoTypes.Certificate>,
  withdrawals: ReadonlyArray<{
    address: CardanoTypes.RewardAddress
    amount: CardanoTypes.BigNum
  }>,
  allowNoOutputs: boolean,
  auxiliaryData?: CardanoTypes.AuxiliaryData,
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
        assets: utxo.assets,
      },
      utxo,
    )
  }

  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
    outputs,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams as any,
    certificates,
    withdrawals,
    allowNoOutputs,
    auxiliaryData,
  )
  const addressedUtxos = unsignedTxResponse.senderUtxos.map((utxo) => {
    const addressedUtxo = addressingMap.get(utxo)

    if (addressedUtxo == null) {
      throw new Error('newAdaUnsignedTx:: utxo reference was changed. Should not happen')
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
async function minRequiredForChange(
  txBuilder: CardanoTypes.TransactionBuilder,
  changeAdaAddr: Address & Addressing,
  value: CardanoTypes.Value,
  protocolParams: Partial<ProtocolParameters>,
) {
  if (changeAdaAddr == null) throw new NoOutputsError()
  const wasmChange = await normalizeToAddress(changeAdaAddr.address)

  if (wasmChange == null) {
    throw new Error('transactions::minRequiredForChange: change not a valid Shelley address')
  }

  const minimumAda = await minAdaRequired(value, protocolParams.minimumUtxoVal as any)
  // we may have to increase the value used up to the minimum ADA required
  const baseValue = await (async () => {
    if ((await (await value.coin()).compare(minimumAda)) < 0) {
      const newVal = await Value.new(minimumAda)
      const assets = await value.multiasset()

      if (assets) {
        await newVal.setMultiasset(assets)
      }

      return newVal
    }

    return value
  })()
  const minRequired = await (
    await txBuilder.feeForOutput(await TransactionOutput.new(wasmChange, baseValue))
  ).checkedAdd(minimumAda)
  return minRequired
}

export const signTransaction = async (
  senderUtxos: Array<AddressedUtxo>,
  unsignedTx: CardanoTypes.TransactionBuilder | CardanoTypes.TransactionBody,
  keyLevel: number,
  signingKey: CardanoTypes.Bip32PrivateKey,
  stakingKeyWits: Set<string>,
  auxiliaryData?: CardanoTypes.AuxiliaryData,
) => {
  const seenByronKeys: Set<string> = new Set()
  const seenKeyHashes: Set<string> = new Set()
  const deduped: Array<AddressedUtxo> = []

  for (const senderUtxo of senderUtxos) {
    const wasmAddr = await normalizeToAddress(senderUtxo.receiver)

    if (wasmAddr == null) {
      throw new Error('signTransaction:: utxo not a valid Shelley address')
    }

    const keyHash = await getCardanoAddrKeyHash(wasmAddr)
    const addrHex = Buffer.from(await wasmAddr.toBytes()).toString('hex')

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
      const keyHex = Buffer.from(await keyHash.toBytes()).toString('hex')

      if (!seenKeyHashes.has(keyHex)) {
        seenKeyHashes.add(keyHex)
        deduped.push(senderUtxo)
      }
    }
  }

  const txBody = unsignedTx instanceof TransactionBuilder ? await unsignedTx.build() : unsignedTx
  const txHash = await hashTransaction(txBody)
  const vkeyWits = await Vkeywitnesses.new()
  const bootstrapWits = await BootstrapWitnesses.new()
  await addWitnesses(txHash, deduped, keyLevel, signingKey, vkeyWits, bootstrapWits)
  const stakingKeySigSet = new Set<string>()

  for (const witness of stakingKeyWits) {
    if (stakingKeySigSet.has(witness)) {
      continue
    }

    stakingKeySigSet.add(witness)
    await vkeyWits.add(await Vkeywitness.fromBytes(Buffer.from(witness, 'hex')))
  }

  const witnessSet = await TransactionWitnessSet.new()

  if ((await bootstrapWits.len()) > 0) {
    await witnessSet.setBootstraps(bootstrapWits)
  }

  if ((await vkeyWits.len()) > 0) await witnessSet.setVkeys(vkeyWits)
  return await Transaction.new(txBody, witnessSet, auxiliaryData as any)
}

async function utxoToTxInput(utxo: RawUtxo) {
  return await TransactionInput.new(await TransactionHash.fromBytes(Buffer.from(utxo.tx_hash, 'hex')), utxo.tx_index)
}

async function addWitnesses(
  txHash: CardanoTypes.TransactionHash,
  uniqueUtxos: Array<AddressedUtxo>, // pre-req: does not contain duplicate keys
  keyLevel: number,
  signingKey: CardanoTypes.Bip32PrivateKey,
  vkeyWits: CardanoTypes.Vkeywitnesses,
  bootstrapWits: CardanoTypes.BootstrapWitnesses,
) {
  // get private keys
  const privateKeys = await Promise.all(
    uniqueUtxos.map(async (utxo) => {
      const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1

      if (lastLevelSpecified !== CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.ADDRESS) {
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

    const byronAddr = await ByronAddress.fromAddress(wasmAddr)

    if (byronAddr == null) {
      const vkeyWit = await makeVkeyWitness(txHash, await privateKeys[i].toRawKey())
      await vkeyWits.add(vkeyWit)
    } else {
      const bootstrapWit = await makeIcarusBootstrapWitness(txHash, byronAddr, privateKeys[i])
      await bootstrapWits.add(bootstrapWit)
    }
  }
}
