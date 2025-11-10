// Ledger payload building functions
// Builds transaction payloads for Ledger hardware wallet signing
import {
  SignTransactionRequest,
  TransactionSigningMode,
  TxAuxiliaryData,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {LedgerUnsignedTx} from './transform'
import {
  assertTagsState,
  doAllSetsHaveTag,
  formatLedgerCertificates,
  formatLedgerWithdrawals,
  transformToLedgerInputs,
  transformToLedgerOutputs,
} from './transform'

// Helper to build CIP-15 payload (legacy voting)
function buildLedgerCIP15Payload(
  _catalystRegistrationData: unknown,
): TxAuxiliaryData {
  // TODO: Implement CIP-15 payload building
  // This is used for older Ledger app versions
  throw new Error('CIP-15 payload building not yet implemented')
}

// Helper to build CIP-36 payload (modern voting)
function buildLedgerCIP36Payload(
  _catalystRegistrationData: unknown,
): TxAuxiliaryData {
  // TODO: Implement CIP-36 payload building
  // This is used for newer Ledger app versions
  throw new Error('CIP-36 payload building not yet implemented')
}

/**
 * Build Ledger payload for voting transactions (Legacy v5)
 */
export async function buildVotingLedgerPayloadV5(
  unsignedTx: LedgerUnsignedTx,
  networkId: number,
  byronNetworkMagic: number,
  stakingDerivationPath?: number[],
): Promise<SignTransactionRequest> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const builtTx = unsignedTx.txBuilder.build()
    assertTagsState(csl, builtTx.toHex())
    const ledgerInputs = transformToLedgerInputs(unsignedTx)
    const ledgerOutputs = await transformToLedgerOutputs(csl, {
      networkId: networkId,
      txOutputs: unsignedTx.txBody.outputs(),
      stakingDerivationPath: stakingDerivationPath,
      changeAddrs: [...unsignedTx.change],
    })

    const withdrawals = unsignedTx.withdrawals
    const ledgerWithdrawal: Array<
      import('@cardano-foundation/ledgerjs-hw-app-cardano').Withdrawal
    > = []
    if (
      withdrawals != null &&
      withdrawals.hasValue() &&
      withdrawals.len() > 0
    ) {
      if (!stakingDerivationPath)
        throw new Error(
          'stakingDerivationPath should have value for withdrawals',
        )
      const withs = formatLedgerWithdrawals(withdrawals, stakingDerivationPath)
      ledgerWithdrawal.push(...withs)
    }

    const certificates = unsignedTx.certificates

    const ledgerCertificates: Array<
      import('@cardano-foundation/ledgerjs-hw-app-cardano').Certificate
    > = []
    if (
      certificates != null &&
      certificates.hasValue() &&
      certificates.len() > 0
    ) {
      if (!stakingDerivationPath)
        throw new Error(
          'stakingDerivationPath should have value for certificates',
        )
      const certs = formatLedgerCertificates(
        certificates,
        stakingDerivationPath,
      )
      ledgerCertificates.push(...certs)
    }

    const ttl = unsignedTx.ttl

    let auxiliaryData: TxAuxiliaryData | null = null

    if (unsignedTx.catalystRegistrationData) {
      auxiliaryData = buildLedgerCIP15Payload(
        unsignedTx.catalystRegistrationData,
      )
    }

    return {
      signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
      tx: {
        inputs: ledgerInputs,
        outputs: ledgerOutputs,
        ttl: ttl === undefined ? ttl : ttl.toString(),
        fee: unsignedTx.txBody.fee().toStr(),
        network: {
          networkId: networkId,
          protocolMagic: byronNetworkMagic,
        },
        withdrawals: ledgerWithdrawal.length === 0 ? null : ledgerWithdrawal,
        certificates:
          ledgerCertificates.length === 0 ? null : ledgerCertificates,
        auxiliaryData,
        validityIntervalStart: undefined,
      },
      additionalWitnessPaths: [],
      options: {
        tagCborSets: doAllSetsHaveTag(
          csl,
          unsignedTx.txBuilder.build().toHex(),
        ),
      },
    }
  })
}

/**
 * Build Ledger payload for standard transactions
 */
export async function buildLedgerPayload(
  unsignedTx: LedgerUnsignedTx,
  networkId: number,
  byronNetworkMagic: number,
  stakingDerivationPath?: number[],
): Promise<SignTransactionRequest> {
  return CardanoMobileWrapped.cslScope(async (csl) => {
    const builtTx = unsignedTx.txBuilder.build()
    assertTagsState(csl, builtTx.toHex())

    const ledgerInputs = transformToLedgerInputs(unsignedTx)
    const ledgerOutputs = await transformToLedgerOutputs(csl, {
      networkId: networkId,
      txOutputs: unsignedTx.txBody.outputs(),
      stakingDerivationPath: stakingDerivationPath,
      changeAddrs: [...unsignedTx.change],
    })

    const withdrawals = unsignedTx.withdrawals
    const ledgerWithdrawal: Array<
      import('@cardano-foundation/ledgerjs-hw-app-cardano').Withdrawal
    > = []
    if (
      withdrawals != null &&
      withdrawals.hasValue() &&
      withdrawals.len() > 0
    ) {
      if (!stakingDerivationPath)
        throw new Error(
          'stakingDerivationPath should have value for withdrawals',
        )
      const withs = formatLedgerWithdrawals(withdrawals, stakingDerivationPath)
      ledgerWithdrawal.push(...withs)
    }

    const certificates = unsignedTx.certificates

    const ledgerCertificates: Array<
      import('@cardano-foundation/ledgerjs-hw-app-cardano').Certificate
    > = []
    if (
      certificates != null &&
      certificates.hasValue() &&
      certificates.len() > 0
    ) {
      if (!stakingDerivationPath)
        throw new Error(
          'stakingDerivationPath should have value for certificates',
        )
      const certs = formatLedgerCertificates(
        certificates,
        stakingDerivationPath,
      )
      ledgerCertificates.push(...certs)
    }

    const ttl = unsignedTx.ttl

    let auxiliaryData: TxAuxiliaryData | null = null

    if (unsignedTx.catalystRegistrationData) {
      auxiliaryData = buildLedgerCIP36Payload(
        unsignedTx.catalystRegistrationData,
      )
    } else if (
      unsignedTx.auxiliaryData &&
      unsignedTx.auxiliaryData.hasValue()
    ) {
      // TODO: Implement blake2b hash for auxiliary data
      // const auxiliaryDataHash = blake2b(
      //   unsignedTx.auxiliaryData.toBytes(),
      //   256
      // )
      // For now, we'll need to implement this when we have the blake2b utility
      throw new Error('Auxiliary data hash calculation not yet implemented')
    }

    return {
      signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
      tx: {
        inputs: ledgerInputs,
        outputs: ledgerOutputs,
        ttl: ttl === undefined ? ttl : ttl.toString(),
        fee: unsignedTx.txBody.fee().toStr(),
        network: {
          networkId: networkId,
          protocolMagic: byronNetworkMagic,
        },
        withdrawals: ledgerWithdrawal.length === 0 ? null : ledgerWithdrawal,
        certificates:
          ledgerCertificates.length === 0 ? null : ledgerCertificates,
        auxiliaryData,
        validityIntervalStart: undefined,
        scriptDataHashHex: unsignedTx.scriptDataHash,
      },
      options: {
        tagCborSets: doAllSetsHaveTag(
          csl,
          unsignedTx.txBuilder.build().toHex(),
        ),
      },
    } as SignTransactionRequest
  })
}
