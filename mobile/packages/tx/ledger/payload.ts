// Ledger payload building functions
// Builds transaction payloads for Ledger hardware wallet signing
import {
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  SignTransactionRequest,
  TransactionSigningMode,
  TxAuxiliaryData,
  TxAuxiliaryDataType,
  TxOutputDestinationType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import type {
  Certificate as LedgerCertificate,
  Withdrawal as LedgerWithdrawal,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {blake2b as blake2bHash} from '@noble/hashes/blake2b'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {
  LedgerUnsignedTx,
  assertTagsState,
  doAllSetsHaveTag,
  formatLedgerCertificates,
  formatLedgerWithdrawals,
  transformToLedgerInputs,
  transformToLedgerOutputs,
} from './transform'

type CatalystRegistrationData = {
  votingPublicKeyHex: string
  stakingPublicKeyHex: string
  paymentAddress: string
  nonce: number
}

// Helper to build CIP-15 payload (legacy voting)
function buildLedgerCIP15Payload(
  catalystRegistrationData: CatalystRegistrationData,
  stakingDerivationPath: number[],
): TxAuxiliaryData {
  const {votingPublicKeyHex, paymentAddress} = catalystRegistrationData
  return {
    type: TxAuxiliaryDataType.CIP36_REGISTRATION,
    params: {
      format: CIP36VoteRegistrationFormat.CIP_15,
      voteKeyHex: votingPublicKeyHex.replace(/^0x/, ''),
      stakingPath: stakingDerivationPath,
      paymentDestination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex: CardanoMobileWrapped.cslScope((csl) => {
            const addr = csl.Address.fromBech32(paymentAddress)
            return Buffer.from(addr.toBytes()).toString('hex')
          }),
        },
      },
      nonce: catalystRegistrationData.nonce,
    },
  }
}

// Helper to build CIP-36 payload (modern voting)
function buildLedgerCIP36Payload(
  catalystRegistrationData: CatalystRegistrationData,
  stakingDerivationPath: number[],
): TxAuxiliaryData {
  const {votingPublicKeyHex, paymentAddress, nonce} = catalystRegistrationData
  return {
    type: TxAuxiliaryDataType.CIP36_REGISTRATION,
    params: {
      format: CIP36VoteRegistrationFormat.CIP_36,
      delegations: [
        {
          type: CIP36VoteDelegationType.KEY,
          voteKeyHex: votingPublicKeyHex.replace(/^0x/, ''),
          weight: 1,
        },
      ],
      stakingPath: stakingDerivationPath,
      paymentDestination: {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex: CardanoMobileWrapped.cslScope((csl) => {
            const addr = csl.Address.fromBech32(paymentAddress)
            return Buffer.from(addr.toBytes()).toString('hex')
          }),
        },
      },
      nonce,
      votingPurpose: 0,
    },
  }
}

/**
 * Build Ledger payload for voting transactions (Legacy v5)
 *
 * NOTE: This function expects to be called within a cslScope.
 * The unsignedTx parameter must contain CSL objects valid within that same scope.
 */
export async function buildVotingLedgerPayloadV5(
  csl: WasmModuleProxy,
  unsignedTx: LedgerUnsignedTx,
  networkId: number,
  byronNetworkMagic: number,
  stakingDerivationPath?: number[],
): Promise<SignTransactionRequest> {
  const builtTxBody = unsignedTx.txBuilder.build()
  // Build full transaction hex for tag checking (body + empty witness set + auxiliary data)
  const emptyWitnessSet = csl.TransactionWitnessSet.new()
  const auxData = unsignedTx.auxiliaryData?.hasValue()
    ? csl.AuxiliaryData.fromBytes(unsignedTx.auxiliaryData.toBytes())
    : undefined
  const fullTx = csl.Transaction.new(builtTxBody, emptyWitnessSet, auxData)
  const fullTxHex = Buffer.from(fullTx.toBytes()).toString('hex')
  assertTagsState(csl, fullTxHex)
  const ledgerInputs = transformToLedgerInputs(unsignedTx)
  const ledgerOutputs = await transformToLedgerOutputs(csl, {
    networkId: networkId,
    txOutputs: unsignedTx.txBody.outputs(),
    stakingDerivationPath: stakingDerivationPath,
    changeAddrs: [...unsignedTx.change],
  })

  const withdrawals = unsignedTx.withdrawals
  const ledgerWithdrawal: Array<LedgerWithdrawal> = []
  if (withdrawals != null && withdrawals.hasValue() && withdrawals.len() > 0) {
    if (!stakingDerivationPath)
      throw new Error('stakingDerivationPath should have value for withdrawals')
    const withs = formatLedgerWithdrawals(withdrawals, stakingDerivationPath)
    ledgerWithdrawal.push(...withs)
  }

  const certificates = unsignedTx.certificates

  const ledgerCertificates: Array<LedgerCertificate> = []
  if (
    certificates != null &&
    certificates.hasValue() &&
    certificates.len() > 0
  ) {
    if (!stakingDerivationPath)
      throw new Error(
        'stakingDerivationPath should have value for certificates',
      )
    const certs = formatLedgerCertificates(certificates, stakingDerivationPath)
    ledgerCertificates.push(...certs)
  }

  const ttl = unsignedTx.ttl

  let auxiliaryData: TxAuxiliaryData | null = null

  if (unsignedTx.catalystRegistrationData) {
    if (!stakingDerivationPath) {
      throw new Error(
        'stakingDerivationPath is required for catalyst registration',
      )
    }
    auxiliaryData = buildLedgerCIP15Payload(
      unsignedTx.catalystRegistrationData,
      stakingDerivationPath,
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
      certificates: ledgerCertificates.length === 0 ? null : ledgerCertificates,
      auxiliaryData,
      validityIntervalStart: undefined,
    },
    additionalWitnessPaths: [],
    options: {
      tagCborSets: doAllSetsHaveTag(csl, fullTxHex),
    },
  }
}

/**
 * Build Ledger payload for standard transactions
 *
 * NOTE: This function expects to be called within a cslScope.
 * The unsignedTx parameter must contain CSL objects valid within that same scope.
 */
export async function buildLedgerPayload(
  csl: WasmModuleProxy,
  unsignedTx: LedgerUnsignedTx,
  networkId: number,
  byronNetworkMagic: number,
  stakingDerivationPath?: number[],
): Promise<SignTransactionRequest> {
  const builtTxBody = unsignedTx.txBuilder.build()
  // Build full transaction hex for tag checking (body + empty witness set + auxiliary data)
  const emptyWitnessSet = csl.TransactionWitnessSet.new()
  const auxData = unsignedTx.auxiliaryData?.hasValue()
    ? csl.AuxiliaryData.fromBytes(unsignedTx.auxiliaryData.toBytes())
    : undefined
  const fullTx = csl.Transaction.new(builtTxBody, emptyWitnessSet, auxData)
  const fullTxHex = Buffer.from(fullTx.toBytes()).toString('hex')
  assertTagsState(csl, fullTxHex)

  const ledgerInputs = transformToLedgerInputs(unsignedTx)
  const ledgerOutputs = await transformToLedgerOutputs(csl, {
    networkId: networkId,
    txOutputs: unsignedTx.txBody.outputs(),
    stakingDerivationPath: stakingDerivationPath,
    changeAddrs: [...unsignedTx.change],
  })

  const withdrawals = unsignedTx.withdrawals
  const ledgerWithdrawal: Array<LedgerWithdrawal> = []
  if (withdrawals != null && withdrawals.hasValue() && withdrawals.len() > 0) {
    if (!stakingDerivationPath)
      throw new Error('stakingDerivationPath should have value for withdrawals')
    const withs = formatLedgerWithdrawals(withdrawals, stakingDerivationPath)
    ledgerWithdrawal.push(...withs)
  }

  const certificates = unsignedTx.certificates

  const ledgerCertificates: Array<LedgerCertificate> = []
  if (
    certificates != null &&
    certificates.hasValue() &&
    certificates.len() > 0
  ) {
    if (!stakingDerivationPath)
      throw new Error(
        'stakingDerivationPath should have value for certificates',
      )
    const certs = formatLedgerCertificates(certificates, stakingDerivationPath)
    ledgerCertificates.push(...certs)
  }

  const ttl = unsignedTx.ttl

  let auxiliaryData: TxAuxiliaryData | null = null

  if (unsignedTx.catalystRegistrationData) {
    if (!stakingDerivationPath) {
      throw new Error(
        'stakingDerivationPath is required for catalyst registration',
      )
    }
    auxiliaryData = buildLedgerCIP36Payload(
      unsignedTx.catalystRegistrationData,
      stakingDerivationPath,
    )
  } else if (unsignedTx.auxiliaryData && unsignedTx.auxiliaryData.hasValue()) {
    // Calculate blake2b hash for auxiliary data (256 bits = 32 bytes)
    const auxiliaryDataBytes = unsignedTx.auxiliaryData.toBytes()
    const auxiliaryDataHash = Buffer.from(
      blake2bHash(auxiliaryDataBytes, {dkLen: 32}),
    ).toString('hex')
    auxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: auxiliaryDataHash,
      },
    }
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
      certificates: ledgerCertificates.length === 0 ? null : ledgerCertificates,
      auxiliaryData,
      validityIntervalStart: undefined,
      scriptDataHashHex: unsignedTx.scriptDataHash,
    },
    options: {
      tagCborSets: doAllSetsHaveTag(csl, fullTxHex),
    },
  } as SignTransactionRequest
}
