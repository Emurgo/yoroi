import {
  CertificateKind,
  ModernUtxo,
  NoOutputsError,
  NotEnoughMoneyToSendError,
  TransactionCertificate,
  addCertificate,
  addInputs,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  filterPureAdaUtxos,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {App, Portfolio, Wallet} from '@yoroi/types'

import {CardanoTypes} from '~/wallets/cardano/types'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export type CreateUnsignedGovernanceTxParams = {
  utxos: ModernUtxo[]
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  votingCertificates: CardanoTypes.Certificate[]
  addressMode: Wallet.AddressMode
}

export async function createUnsignedGovernanceTx({
  utxos,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  votingCertificates,
  addressMode,
}: CreateUnsignedGovernanceTxParams): Promise<{cbor: string}> {
  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Estimate fee for governance transaction
  // Governance transactions are typically small (~400-600 bytes)
  const estimatedTxSize = 600 // bytes - conservative estimate
  const estimatedFee =
    BigInt(protocolParams.linearFee.constant) +
    BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

  // Governance transactions don't require deposit, just fees
  const requiredAda = estimatedFee.toString()

  // Select UTXOs preferring pure ADA first to avoid issues with change outputs containing tokens
  // This strategy minimizes the minimum ADA required for change outputs
  const selectUtxosWithStrategy = (requiredAdaAmount: string): ModernUtxo[] => {
    // Filter pure ADA UTXOs (no tokens)
    const pureAdaUtxos = filterPureAdaUtxos(utxos, primaryTokenId)
    const utxosWithTokens = utxos.filter((utxo) => !pureAdaUtxos.includes(utxo))

    // For pure ADA UTXOs, use smallest-first to minimize change
    const sortedPureAda = [...pureAdaUtxos].sort((a, b) => {
      const aAda = BigInt(a.balance[primaryTokenId] || '0')
      const bAda = BigInt(b.balance[primaryTokenId] || '0')
      if (aAda < bAda) return -1
      if (aAda > bAda) return 1
      return 0
    })

    const requiredAdaBigInt = BigInt(requiredAdaAmount)
    const selected: ModernUtxo[] = []
    let selectedAda = BigInt(0)

    // First, try to select from pure ADA UTXOs (smallest first)
    for (const utxo of sortedPureAda) {
      if (selectedAda >= requiredAdaBigInt) break
      selected.push(utxo)
      selectedAda += BigInt(utxo.balance[primaryTokenId] || '0')
    }

    // If we don't have enough from pure ADA UTXOs, add UTXOs with tokens
    // But account for min UTXO requirement for change outputs with tokens
    if (selectedAda < requiredAdaBigInt) {
      // When selecting UTXOs with tokens, we need to ensure:
      // 1. We have enough ADA for fees (actual fee will be higher due to tokens)
      // 2. We have enough ADA left for min UTXO in change output with tokens
      // The base minUtxoValue (1 ADA) is often insufficient for UTXOs with many tokens
      // We add a buffer to account for the actual minimum ADA required
      const minUtxoValue = BigInt(
        protocolParamsConfig.minimumUtxoVal || '1000000',
      ) // Base min UTXO
      // For UTXOs with tokens, the actual minimum can be much higher
      // Add a conservative buffer: 2 ADA for tokens (can be more for many tokens)
      const tokenBuffer = BigInt('2000000') // 2 ADA buffer
      const feeBuffer = BigInt('100000') // 0.1 ADA buffer for token-related fee increase
      const requiredWithBuffer =
        requiredAdaBigInt + minUtxoValue + tokenBuffer + feeBuffer

      // Use largest-first for UTXOs with tokens (to minimize number of UTXOs)
      const additionalUtxos = selectUtxosForAmount(
        utxosWithTokens,
        requiredWithBuffer.toString(),
        primaryTokenId,
      )

      selected.push(...additionalUtxos)
    }

    return selected
  }

  // Select UTXOs using the strategy that prefers pure ADA
  const selectedUtxos = selectUtxosWithStrategy(requiredAda)

  try {
    // Build transaction using functional TransactionBuilder
    let builderState = createTransactionBuilder()

    // Add only selected UTXOs as inputs
    builderState = addInputs(builderState, selectedUtxos)

    // Convert CSL Certificate objects to certificate data to avoid mixing CSL instances
    // Extract certificate data from CSL objects within a CSL scope
    const certificateDataList: TransactionCertificate[] =
      CardanoMobileWrapped.cslScope(() => {
        const result: TransactionCertificate[] = []
        // DRepKind enum values from @emurgo/cross-csl-core
        const DRepKind = {
          KeyHash: 0,
          ScriptHash: 1,
          AlwaysAbstain: 2,
          AlwaysNoConfidence: 3,
        }
        for (const cert of votingCertificates) {
          // Extract stake credential and certificate kind
          const voteDeleg = cert.asVoteDelegation()
          if (voteDeleg) {
            const stakeCred = voteDeleg.stakeCredential()
            const keyHash = stakeCred.toKeyhash()
            if (!keyHash) {
              throw new Error('Vote delegation certificate has no key hash')
            }
            const drep = voteDeleg.drep()
            const drepKind = drep.kind()
            // Handle different DRep types using kind() method
            let drepValue:
              | {KeyHash: string}
              | {ScriptHash: string}
              | 'AlwaysAbstain'
              | 'AlwaysNoConfidence'
            if (drepKind === DRepKind.AlwaysAbstain) {
              drepValue = 'AlwaysAbstain'
            } else if (drepKind === DRepKind.AlwaysNoConfidence) {
              drepValue = 'AlwaysNoConfidence'
            } else if (drepKind === DRepKind.KeyHash) {
              const drepKeyHash = drep.toKeyHash()
              if (drepKeyHash) {
                drepValue = {KeyHash: drepKeyHash.toHex()}
              } else {
                throw new Error(
                  'Vote delegation certificate DRep KeyHash is invalid',
                )
              }
            } else if (drepKind === DRepKind.ScriptHash) {
              const drepScriptHash = drep.toScriptHash()
              if (drepScriptHash) {
                drepValue = {ScriptHash: drepScriptHash.toHex()}
              } else {
                throw new Error(
                  'Vote delegation certificate DRep ScriptHash is invalid',
                )
              }
            } else {
              throw new Error(
                `Vote delegation certificate DRep has unknown kind: ${drepKind}`,
              )
            }
            result.push({
              kind: CertificateKind.VoteDelegation,
              stakeCredentialKeyHashHex: keyHash.toHex(),
              drep: drepValue,
            })
          } else {
            throw new Error(
              `Unsupported certificate type in governance transaction: ${cert}`,
            )
          }
        }
        return result
      })

    // Add voting certificates as data (not CSL objects)
    for (const certData of certificateDataList) {
      builderState = addCertificate(builderState, certData)
    }

    // Set change address
    builderState = setChangeAddress(builderState, changeAddress)

    // Set TTL with buffer
    builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

    // Build the transaction
    return await buildRecipeTransaction(
      builderState,
      protocolParamsConfig,
      primaryTokenId,
    )
  } catch (e) {
    if (e instanceof NotEnoughMoneyToSendError || e instanceof NoOutputsError)
      throw e
    throw new App.Errors.LibraryError((e as Error).message)
  }
}
