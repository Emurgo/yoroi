/* eslint-disable @typescript-eslint/no-explicit-any */
import {isArray, isString} from '@yoroi/common'
import assert from 'assert'
import {BigNumber} from 'bignumber.js'

import {
  BaseAsset,
  CERTIFICATE_KIND,
  DefaultAsset,
  NetworkId,
  Token,
  Transaction,
  TRANSACTION_DIRECTION,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TransactionInfo,
} from '../../types'
import {getDefaultNetworkTokenEntry, MultiToken, strToDefaultMultiAsset} from '../MultiToken'
import {multiTokenFromRemote} from '../utils'

export const ASSURANCE_LEVELS = {
  LOW: 3,
  MEDIUM: 9,
}

type TransactionAssurance = 'PENDING' | 'FAILED' | 'LOW' | 'MEDIUM' | 'HIGH'
export const getTransactionAssurance = (
  status: (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS],
  confirmations: number,
): TransactionAssurance => {
  if (status === TRANSACTION_STATUS.PENDING) return 'PENDING'
  if (status === TRANSACTION_STATUS.FAILED) return 'FAILED'

  if (status !== TRANSACTION_STATUS.SUCCESSFUL) {
    throw new Error('Internal error - unknown transaction status')
  }

  const assuranceLevelCutoffs = ASSURANCE_LEVELS
  if (confirmations < assuranceLevelCutoffs.LOW) return 'LOW'
  if (confirmations < assuranceLevelCutoffs.MEDIUM) return 'MEDIUM'
  return 'HIGH'
}

const getTxTokens = (tx: Transaction, networkId: NetworkId): Record<string, Token> => {
  const tokens: Record<string, Token> = {}
  const rawTokens: Array<BaseAsset> = []
  tx.inputs.forEach((i) => rawTokens.push(...i.assets))
  tx.outputs.forEach((o) => rawTokens.push(...o.assets))
  rawTokens.forEach((t) => {
    if (tokens[t.assetId] == null) {
      tokens[t.assetId] = {
        networkId,
        isDefault: false,
        identifier: t.assetId,
        metadata: {
          policyId: t.policyId,
          assetName: t.name,
          // no metadata for now
          type: 'Cardano',
          numberOfDecimals: 0,
          ticker: null,
          longName: null,
          maxSupply: null,
        },
      }
    }
  })
  return tokens
}

const _sum = (
  a: Array<{
    address: string
    amount: string
    assets: Array<BaseAsset>
  }>,
  networkId: NetworkId,
  defaultAsset: DefaultAsset,
): MultiToken =>
  a.reduce(
    (acc: MultiToken, x) => acc.joinAddMutable(multiTokenFromRemote(x, networkId)),
    new MultiToken([], getDefaultNetworkTokenEntry(defaultAsset)),
  )

const _multiPartyWarningCache = {}
export const processTxHistoryData = (
  tx: Transaction,
  ownAddresses: Array<string>,
  confirmations: number,
  networkId: NetworkId,
  memo: string | null,
  defaultAsset: DefaultAsset,
): TransactionInfo => {
  const metadata = tx.metadata?.reduce<TransactionInfo['metadata']>(
    (metadatas: TransactionInfo['metadata'], metadata) => {
      if (metadata?.label && metadatas != null) {
        if (isArray(metadata?.map_json?.msg)) {
          metadatas[metadata.label] = metadata.map_json.msg.join('')
        }
        if (isString(metadata?.map_json?.msg)) {
          metadatas[metadata.label] = metadata.map_json.msg
        }
      }
      return metadatas
    },
    {},
  )

  const _strToDefaultMultiAsset = (amount: string) => strToDefaultMultiAsset(amount, networkId, defaultAsset)
  // collateral
  const collateral = tx.collateralInputs || []
  const isNonNativeScriptExecution = Number(tx.scriptSize) > 0 || collateral.length > 0
  const isInvalidScriptExecution = isNonNativeScriptExecution && !tx.validContract
  // TODO: check if is it possible to have not owned address in collateral inputs
  // NOTE: only add the tx inputs to account it if the execution has failed
  const ownUtxoCollateralInputs = isInvalidScriptExecution
    ? collateral.filter(({address}) => ownAddresses.includes(address))
    : []
  // NOTE: will ignore the inputs and outputs if the tx script execution failed
  const utxoInputs = isInvalidScriptExecution ? [] : tx.inputs
  const utxoOutputs = isInvalidScriptExecution ? [] : tx.outputs
  const accountingInputs = isInvalidScriptExecution
    ? []
    : tx.withdrawals.map((w) => ({
        address: w.address,
        amount: w.amount,
        assets: [],
      }))
  const ownUtxoInputs = utxoInputs.filter(({address}) => ownAddresses.includes(address))
  const ownUtxoOutputs = utxoOutputs.filter(({address}) => ownAddresses.includes(address))

  const ownImplicitInput: MultiToken = _strToDefaultMultiAsset('0')

  const ownImplicitOutput: MultiToken = (() => {
    if (tx.type === TRANSACTION_TYPE.SHELLEY) {
      let implicitOutputSum = new BigNumber(0)

      for (const cert of tx.certificates) {
        if (cert.kind !== CERTIFICATE_KIND.MOVE_INSTANTANEOUS_REWARDS) {
          continue
        }

        const {rewards} = cert as any
        if (rewards == null) continue // shouldn't happen

        for (const rewardAddr in rewards) {
          if (ownAddresses.includes(rewardAddr)) {
            implicitOutputSum = implicitOutputSum.plus(rewards[rewardAddr])
          }
        }
      }

      return _strToDefaultMultiAsset(implicitOutputSum.toString())
    }

    return _strToDefaultMultiAsset('0')
  })()

  const unifiedInputs = [...utxoInputs, ...accountingInputs, ...ownUtxoCollateralInputs]
  const unifiedOutputs = [
    ...utxoOutputs, // ...accountingOutpus,
  ]
  const ownInputs = unifiedInputs.filter(({address}) => ownAddresses.includes(address))
  const ownOutputs = unifiedOutputs.filter(({address}) => ownAddresses.includes(address))

  const totalIn = _sum(unifiedInputs, networkId, defaultAsset)

  const totalOut = _sum(unifiedOutputs, networkId, defaultAsset)

  const ownIn = _sum(ownInputs, networkId, defaultAsset).joinAddMutable(ownImplicitInput)

  const ownOut = _sum(ownOutputs, networkId, defaultAsset).joinAddMutable(ownImplicitOutput)

  const hasOnlyOwnInputs = ownInputs.length === unifiedInputs.length
  const hasOnlyOwnOutputs = ownOutputs.length === unifiedOutputs.length
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs
  const isMultiParty = ownInputs.length > 0 && ownInputs.length !== unifiedInputs.length

  if (isMultiParty && !_multiPartyWarningCache[tx.id]) {
    _multiPartyWarningCache[tx.id] = true
  }

  /*
  Calculating costs and direction from just inputs and outputs is quite tricky.
  Let's use the representation where amounts represent gain in our
  wallet after the
  transaction, i.e.:
  * positive amounts = incoming, negative amounts = outgoing
  * by the same logic, fees are represented by negative numbers
   Then our main goal is to maintain the following two invariants:
  * brutto amount = sum of our outputs - sum of our inputs
  * brutto amount = netto (shown) amount + (our) fee  (Note the plus here)
  * fee is either zero (no cost) or negative (transaction costed us something)
   1) If all inputs and outputs are our addresses, this is clearly an intrawallet
    transaction. There is no point in calculating the amount,
    only the transaction
    fee.
   2) If we do not have our address in the inputs, this is clearly an incoming
    transaction. Fee does not apply as we are just receiving money.
   3) If all inputs are ours (and at least one output is not), this is an
    outgoing transaction. Fee is the difference between total
    inputs and total outputs.
   4) if only some of the inputs are ours we are handling a special
    multi-party transaction.
    Such transactions could be constructed by hand but in reality it is probable
    that our wallet just failed to discover one of its own addresses.
    We will conservatively mark zero fee.
  */
  const brutto = ownOut.joinSubtractMutable(ownIn)
  const totalFee = totalOut.joinSubtractMutable(totalIn) // should be negative

  // note(v-almonacid): delta will be used to compute the wallet balance
  // and is defined as
  //    delta = own utxo outputs - own utxo inputs
  // Then the balance is obtained as
  //    balance = sum(delta)
  // recall: if the tx has withdrawals or refunds to this wallet, they are
  // included in own utxo outputs
  const delta = _sum(ownUtxoOutputs, networkId, defaultAsset).joinSubtractMutable(
    _sum(ownUtxoInputs, networkId, defaultAsset),
  )

  let amount
  let fee
  const remoteFee = tx.fee != null ? _strToDefaultMultiAsset(new BigNumber(tx.fee).times(-1).toString()) : null
  let direction

  if (isInvalidScriptExecution) {
    direction = TRANSACTION_DIRECTION.SELF
    amount = brutto
    // NOTE: the collateral is the fee when it has failed
    fee = null
  } else if (isIntraWallet) {
    direction = TRANSACTION_DIRECTION.SELF
    amount = _strToDefaultMultiAsset('0')
    fee = remoteFee ?? totalFee
  } else if (isMultiParty) {
    direction = TRANSACTION_DIRECTION.MULTI
    amount = brutto
    fee = null
  } else if (hasOnlyOwnInputs) {
    direction = TRANSACTION_DIRECTION.SENT
    amount = brutto.joinSubtractMutable(totalFee)
    fee = remoteFee ?? totalFee
  } else {
    assert(ownInputs.length === 0, 'This cannot be receiving transaction')
    direction = TRANSACTION_DIRECTION.RECEIVED
    amount = brutto
    fee = null
  }

  const assurance = getTransactionAssurance(tx.status, confirmations)
  const tokens = getTxTokens(tx, networkId)

  const _remoteAssetAsTokenEntry = (asset: BaseAsset) => ({
    identifier: asset.assetId,
    amount: new BigNumber(asset.amount),
    networkId,
  })

  return {
    id: tx.id,
    inputs: tx.inputs.map(({address, assets, amount, id}) => ({
      address,
      amount,
      assets: assets.map(_remoteAssetAsTokenEntry),
      id,
    })),
    outputs: tx.outputs.map(({address, assets, amount}) => ({
      address,
      amount,
      assets: assets.map(_remoteAssetAsTokenEntry),
    })),
    amount: amount.asArray(),
    fee: fee != null ? fee.asArray() : null,
    delta: delta.asArray(),
    confirmations,
    direction,
    submittedAt: tx.submittedAt,
    lastUpdatedAt: tx.lastUpdatedAt,
    status: tx.status,
    assurance,
    tokens,
    blockNumber: tx.blockNum ?? 0,
    memo,
    metadata,
  }
}
