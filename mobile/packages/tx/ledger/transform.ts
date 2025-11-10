// Ledger transformation utilities
// Transforms Cardano transactions to Ledger hardware wallet format
import {isHex} from '@yoroi/common'

import {
  AddressType as LedgerAddressType,
  AssetGroup as LedgerAssetGroup,
  Certificate as LedgerCertificate,
  CertificateType as LedgerCertificateType,
  CredentialParamsType as LedgerCredentialParamsType,
  DRepParams as LedgerDRepParams,
  DRepParamsType as LedgerDRepParamsType,
  DeviceOwnedAddress as LedgerDeviceOwnedAddress,
  Token as LedgerToken,
  TxInput as LedgerTxInput,
  TxOutput as LedgerTxOutput,
  Withdrawal as LedgerWithdrawal,
  TxOutputDestinationType,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {
  Address,
  Certificates as CSLCertificates,
  Withdrawals as CSLWithdrawals,
  MultiAsset,
  TransactionOutputs,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
// Note: This will need to be updated when we migrate UnsignedTx type
// For now, we'll use a minimal interface that matches what Ledger functions need
import type {TransactionBody} from '@emurgo/cross-csl-core'
import * as bech32 from 'bech32'

import {CardanoMobileWrapped} from '../../../src/wallets/cardano/wrappedCsl'
import {Addressing, AddressingAddress, Bip44DerivationLevels} from '../types'

export interface LedgerUnsignedTx {
  senderUtxos: Array<{
    txHash: string
    txIndex: number
    addressing: Addressing
  }>
  txBuilder: {
    build(): TransactionBody
  }
  txBody: {
    outputs(): TransactionOutputs
    fee(): {toStr(): string}
  }
  change: Array<AddressingAddress>
  withdrawals?: CSLWithdrawals | null
  certificates?: CSLCertificates | null
  ttl?: number
  auxiliaryData?: {
    hasValue(): boolean
    toBytes(): Uint8Array
  } | null
  catalystRegistrationData?: unknown
  scriptDataHash?: string
}

/**
 * Transform transaction inputs to Ledger format
 */
export const transformToLedgerInputs = (
  unsignedTx: LedgerUnsignedTx,
): Array<LedgerTxInput> => {
  const senderUtxos = unsignedTx.senderUtxos
  for (const input of senderUtxos) {
    verifyFromBip44Root(input.addressing)
  }
  const formatted = senderUtxos.map((input) => ({
    txHashHex: input.txHash,
    outputIndex: input.txIndex,
    path: input.addressing.path,
  }))

  const correctOrderInputs = unsignedTx.txBuilder.build().inputs()
  const ordered: LedgerTxInput[] = []
  const inputsLength = correctOrderInputs.len()

  for (let i = 0; i < inputsLength; i++) {
    const input = correctOrderInputs.get(i)
    const txId = Buffer.from(input.transactionId().toBytes()).toString('hex')
    const index = input.index()
    const matchingInput = formatted.find(
      (input) => input.txHashHex === txId && input.outputIndex === index,
    )
    if (!matchingInput) {
      throw new Error(
        `transformToLedgerInputs: no input found to match tx ${txId} at output index ${index}`,
      )
    }
    ordered.push(matchingInput)
  }

  return ordered
}

const areAddressesTheSame = (
  wasm: WasmModuleProxy,
  addr1: string,
  addr2: string,
): boolean => {
  const addrToHex = (addr: string): string => {
    const addrBech32 = bech32.decodeUnsafe(addr, addr.length)
    let hex: string
    if (addrBech32) {
      hex = Buffer.from(bech32.fromWords(addrBech32.words)).toString('hex')
    } else if (wasm.ByronAddress.isValid(addr)) {
      hex = Buffer.from(
        wasm.ByronAddress.fromBase58(addr).toAddress().toBytes(),
      ).toString('hex')
    } else if (isHex(addr)) {
      hex = addr
    } else {
      throw new Error(
        'compareAddresses::addrToHex: unexpected address format - should be either hex, base58 (Byron) or bech32',
      )
    }
    return hex.toLowerCase()
  }

  const addr1Hex = addrToHex(addr1)
  const addr2Hex = addrToHex(addr2)
  return addr1Hex === addr2Hex
}

/**
 * Transform transaction outputs to Ledger format
 */
export const transformToLedgerOutputs = async (
  _wasm: WasmModuleProxy,
  request: {
    networkId: number
    txOutputs: TransactionOutputs
    changeAddrs: Array<AddressingAddress>
    stakingDerivationPath?: number[]
  },
): Promise<Array<LedgerTxOutput>> => {
  return CardanoMobileWrapped.cslScope((csl) => {
    const result: LedgerTxOutput[] = []
    for (let i = 0; i < request.txOutputs.len(); i++) {
      const output = request.txOutputs.get(i)
      const address = output.address()
      const jsAddr = toHexOrBase58(csl, address)

      let changeAddr: AddressingAddress | null = null
      for (const change of request.changeAddrs) {
        if (areAddressesTheSame(csl, jsAddr, change.address)) {
          changeAddr = change
          break
        }
      }

      const dataHash = output.hasDataHash()
        ? (output.dataHash()?.toHex() ?? '')
        : undefined

      if (changeAddr != null && changeAddr.addressing) {
        verifyFromBip44Root(changeAddr.addressing)
        const addressParams = toLedgerAddressParameters(csl, {
          networkId: request.networkId,
          address,
          path: changeAddr.addressing.path,
          stakingDerivationPath: request.stakingDerivationPath,
        })
        const outputAmount = output.amount()
        const ledgerOutput: LedgerTxOutput = {
          amount: output.amount().coin().toStr(),
          tokenBundle: toLedgerTokenBundle(outputAmount.multiasset()),
          datumHashHex: dataHash,
          destination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: addressParams,
          },
        }
        result.push(ledgerOutput)
      } else {
        const ledgerOutput: LedgerTxOutput = {
          amount: output.amount().coin().toStr(),
          tokenBundle: toLedgerTokenBundle(output.amount().multiasset()),
          datumHashHex: dataHash,
          destination: {
            type: TxOutputDestinationType.THIRD_PARTY,
            params: {
              addressHex: Buffer.from(address.toBytes()).toString('hex'),
            },
          },
        }
        result.push(ledgerOutput)
      }
    }
    return result
  })
}

/**
 * Verify that addressing starts from BIP44 root
 */
export const verifyFromBip44Root = (addressing: Addressing): void => {
  const accountPosition = addressing.startLevel
  if (accountPosition !== Bip44DerivationLevels.PURPOSE.level) {
    throw new Error(`verifyFromBip44Root addressing does not start from root`)
  }
  const lastLevelSpecified = addressing.startLevel + addressing.path.length - 1
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`verifyFromBip44Root incorrect addressing size`)
  }
}

/**
 * Convert address to Ledger address parameters
 */
export const toLedgerAddressParameters = (
  wasm: WasmModuleProxy,
  request: {
    networkId: number
    address: Address
    path: Array<number>
    stakingDerivationPath?: number[]
  },
): LedgerDeviceOwnedAddress => {
  {
    const byronAddr = wasm.ByronAddress.fromAddress(request.address)
    if (byronAddr) {
      return {
        type: LedgerAddressType.BYRON,
        params: {
          spendingPath: request.path,
        },
      }
    }
  }
  {
    const baseAddr = wasm.BaseAddress.fromAddress(request.address)
    if (baseAddr) {
      if (!request.stakingDerivationPath) {
        const stakeCred = baseAddr.stakeCred()
        const wasmHash = stakeCred.toKeyhash() ?? stakeCred.toScripthash()
        if (!wasmHash) {
          throw new Error(`toLedgerAddressParameters unknown hash type`)
        }
        const hashInAddress = Buffer.from(wasmHash.toBytes()).toString('hex')

        return {
          // can't always know staking key path since address may not belong to the wallet
          // (mangled address)
          type: LedgerAddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: request.path,
            stakingKeyHashHex: hashInAddress,
          },
        }
      }
      return {
        type: LedgerAddressType.BASE_PAYMENT_KEY_STAKE_KEY,
        params: {
          spendingPath: request.path,
          stakingPath: request.stakingDerivationPath,
        },
      }
    }
  }
  {
    const ptrAddr = wasm.PointerAddress.fromAddress(request.address)
    if (ptrAddr) {
      const pointer = ptrAddr.stakePointer()
      return {
        type: LedgerAddressType.POINTER_KEY,
        params: {
          spendingPath: request.path,
          stakingBlockchainPointer: {
            blockIndex: pointer.slot(),
            txIndex: pointer.txIndex(),
            certificateIndex: pointer.certIndex(),
          },
        },
      }
    }
  }
  {
    const enterpriseAddr = wasm.EnterpriseAddress.fromAddress(request.address)
    if (enterpriseAddr) {
      return {
        type: LedgerAddressType.ENTERPRISE_KEY,
        params: {
          spendingPath: request.path,
        },
      }
    }
  }
  {
    const rewardAddr = wasm.RewardAddress.fromAddress(request.address)
    if (rewardAddr) {
      return {
        type: LedgerAddressType.REWARD_KEY,
        params: {
          stakingPath: request.path, // reward addresses use spending path
        },
      }
    }
  }
  throw new Error(`toLedgerAddressParameters unknown address type`)
}

/**
 * Convert MultiAsset to Ledger token bundle format
 */
export const toLedgerTokenBundle = (
  assets: MultiAsset | undefined | null,
): Array<LedgerAssetGroup> | null => {
  if (assets === null || !assets) return null
  const assetGroup: Array<LedgerAssetGroup> = []

  const policyHashes = assets.keys()
  for (let i = 0; i < policyHashes.len(); i++) {
    const policyId = policyHashes.get(i)
    const assetsForPolicy = assets.get(policyId)
    if (!assetsForPolicy) continue

    const tokens: Array<LedgerToken> = []
    const assetNames = assetsForPolicy.keys()
    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j)
      const amount = assetsForPolicy.get(assetName)
      if (!amount) continue

      tokens.push({
        amount: amount.toStr(),
        assetNameHex: Buffer.from(assetName.name()).toString('hex'),
      })
    }
    // sort by asset name to the order specified by rfc7049
    tokens.sort((token1, token2) =>
      compareCborKey(token1.assetNameHex, token2.assetNameHex),
    )
    assetGroup.push({
      policyIdHex: Buffer.from(policyId.toBytes()).toString('hex'),
      tokens,
    })
  }
  // sort by policy id to the order specified by rfc7049
  assetGroup.sort((asset1, asset2) =>
    compareCborKey(asset1.policyIdHex, asset2.policyIdHex),
  )
  return assetGroup
}

/**
 * Compare CBOR keys for sorting
 */
export const compareCborKey = (hex1: string, hex2: string): number => {
  if (hex1.length < hex2.length) {
    return -1
  }
  if (hex1.length > hex2.length) {
    return 1
  }
  if (hex1 < hex2) {
    return -1
  }
  if (hex1 > hex2) {
    return 1
  }
  return 0
}

/**
 * Format certificates for Ledger
 */
export const formatLedgerCertificates = (
  certificates: CSLCertificates,
  stakingDerivationPath: number[],
): Array<LedgerCertificate> => {
  const result: Array<LedgerCertificate> = []
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i)

    const registrationCert = cert.asStakeRegistration()
    if (registrationCert != null && registrationCert.hasValue()) {
      result.push({
        type: LedgerCertificateType.STAKE_REGISTRATION,
        params: {
          stakeCredential: {
            type: LedgerCredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
        },
      })
      continue
    }
    const deregistrationCert = cert.asStakeDeregistration()
    if (deregistrationCert != null && deregistrationCert.hasValue()) {
      result.push({
        type: LedgerCertificateType.STAKE_DEREGISTRATION,
        params: {
          stakeCredential: {
            type: LedgerCredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
        },
      })
      continue
    }
    const delegationCert = cert.asStakeDelegation()
    if (delegationCert != null && delegationCert.hasValue()) {
      result.push({
        type: LedgerCertificateType.STAKE_DELEGATION,
        params: {
          stakeCredential: {
            type: LedgerCredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
          poolKeyHashHex: Buffer.from(
            delegationCert.poolKeyhash().toBytes(),
          ).toString('hex'),
        },
      })
      continue
    }
    const voteDelegationCert = cert.asVoteDelegation()
    if (voteDelegationCert != null) {
      const drepParams = mapDrepParams(voteDelegationCert)
      if (drepParams) {
        result.push({
          type: LedgerCertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: {
              type: LedgerCredentialParamsType.KEY_PATH,
              keyPath: stakingDerivationPath,
            },
            dRep: drepParams,
          },
        })
        continue
      }
    }

    throw new Error(
      `formatLedgerCertificates Ledger doesn't support this certificate type`,
    )
  }
  return result
}

const mapDrepParams = (
  certificate: import('@emurgo/cross-csl-core').VoteDelegation,
): LedgerDRepParams | undefined => {
  const drep = certificate.drep()
  const drepKind = drep.kind()

  // DRepKind enum values from @emurgo/cross-csl-core
  const DRepKind = {
    KeyHash: 0,
    ScriptHash: 1,
    AlwaysAbstain: 2,
    AlwaysNoConfidence: 3,
  }

  if (drepKind === DRepKind.KeyHash) {
    const keyHash = drep.toKeyHash()
    const keyHashBytes = keyHash?.toBytes()

    if (keyHashBytes)
      return {
        type: LedgerDRepParamsType.KEY_HASH,
        keyHashHex: Buffer.from(keyHashBytes).toString('hex'),
      }

    throw new Error('mapDrepParams invalid keyHashBytes')
  }

  if (drepKind === DRepKind.ScriptHash) {
    const scriptHash = drep.toScriptHash()
    const scriptHashBytes = scriptHash?.toBytes()

    if (scriptHashBytes)
      return {
        type: LedgerDRepParamsType.SCRIPT_HASH,
        scriptHashHex: Buffer.from(scriptHashBytes).toString('hex'),
      }

    throw new Error('mapDrepParams invalid scriptHashBytes')
  }

  if (drepKind === DRepKind.AlwaysAbstain) {
    return {
      type: LedgerDRepParamsType.ABSTAIN,
    }
  }

  if (drepKind === DRepKind.AlwaysNoConfidence) {
    return {
      type: LedgerDRepParamsType.NO_CONFIDENCE,
    }
  }

  throw new Error('mapDrepParams invalid DRep Kind')
}

/**
 * Format withdrawals for Ledger
 */
export const formatLedgerWithdrawals = (
  withdrawals: CSLWithdrawals,
  stakingDerivationPath: number[],
): Array<LedgerWithdrawal> => {
  const result: Array<LedgerWithdrawal> = []

  const withdrawalKeys = withdrawals.keys()
  for (let i = 0; i < withdrawalKeys.len(); i++) {
    const rewardAddress = withdrawalKeys.get(i)
    const withdrawalAmount = withdrawals.get(rewardAddress)
    if (withdrawalAmount === null || !withdrawalAmount) {
      throw new Error(`formatLedgerWithdrawals should never happen`)
    }

    result.push({
      amount: withdrawalAmount.toStr(),
      stakeCredential: {
        type: LedgerCredentialParamsType.KEY_PATH,
        keyPath: stakingDerivationPath,
      },
    })
  }
  return result
}

/**
 * Helper to convert address to hex or base58
 */
function toHexOrBase58(wasm: WasmModuleProxy, address: Address): string {
  const asByron = wasm.ByronAddress.fromAddress(address)
  if (asByron === null || !asByron) {
    return Buffer.from(address.toBytes()).toString('hex')
  }
  return asByron.toBase58()
}

/**
 * Assert that transaction sets have proper tag state for Ledger signing
 */
export const assertTagsState = (wasm: WasmModuleProxy, txHex: string): void => {
  const tagsState = wasm.hasTransactionSetTag(Buffer.from(txHex, 'hex'))

  if (tagsState === wasm.TransactionSetsState.MixedSets) {
    throw new Error('Transaction with mixed sets cannot be signed by Ledger')
  }
}

/**
 * Check if all transaction sets have tags
 */
export const doAllSetsHaveTag = (
  wasm: WasmModuleProxy,
  txHex: string,
): boolean => {
  const tagsState = wasm.hasTransactionSetTag(Buffer.from(txHex, 'hex'))
  return tagsState === wasm.TransactionSetsState.AllSetsHaveTag
}
