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

  // Select only necessary UTXOs to cover fees
  const selectedUtxos = selectUtxosForAmount(utxos, requiredAda, primaryTokenId)

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
