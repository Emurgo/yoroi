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
  Certificates,
  MultiAsset,
  TransactionOutputs,
  WasmModuleProxy,
  Withdrawals,
} from '@emurgo/cross-csl-core'
import {bech32} from 'bech32'

import {Addressing, AddressingAddress, Bip44DerivationLevels} from '../types'

// Note: This will need to be updated when we migrate UnsignedTx type
// For now, we'll use a minimal interface that matches what Ledger functions need
export interface LedgerUnsignedTx {
  senderUtxos: Array<{
    txHash: string
    txIndex: number
    addressing: Addressing
  }>
  txBuilder: {
    build(): Promise<{
      inputs(): Promise<{
        len(): Promise<number>
        get(index: number): Promise<{
          transactionId(): Promise<{toBytes(): Promise<Uint8Array>}>
          index(): Promise<number>
        }>
      }>
    }>
  }
  txBody: {
    outputs(): Promise<TransactionOutputs>
    fee(): Promise<{toStr(): Promise<string>}>
  }
  change: Array<AddressingAddress>
  withdrawals?: {
    hasValue(): Promise<boolean>
    len(): Promise<number>
  } | null
  certificates?: {
    hasValue(): Promise<boolean>
    len(): Promise<number>
  } | null
  ttl?: number
  auxiliaryData?: {
    hasValue(): Promise<boolean>
    toBytes(): Promise<Uint8Array>
  } | null
  catalystRegistrationData?: unknown
  scriptDataHash?: string
}

/**
 * Transform transaction inputs to Ledger format
 */
export const transformToLedgerInputs = async (
  unsignedTx: LedgerUnsignedTx,
): Promise<Array<LedgerTxInput>> => {
  const senderUtxos = unsignedTx.senderUtxos
  for (const input of senderUtxos) {
    verifyFromBip44Root(input.addressing)
  }
  const formatted = senderUtxos.map((input) => ({
    txHashHex: input.txHash,
    outputIndex: input.txIndex,
    path: input.addressing.path,
  }))

  const correctOrderInputs = await (await unsignedTx.txBuilder.build()).inputs()
  const ordered: LedgerTxInput[] = []
  const inputsLength = await correctOrderInputs.len()

  for (let i = 0; i < inputsLength; i++) {
    const input = await correctOrderInputs.get(i)
    const txId = Buffer.from(
      await (await input.transactionId()).toBytes(),
    ).toString('hex')
    const index = await input.index()
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

const areAddressesTheSame = async (
  wasm: WasmModuleProxy,
  addr1: string,
  addr2: string,
): Promise<boolean> => {
  const addrToHex = async (addr: string): Promise<string> => {
    const addrBech32 = bech32.decodeUnsafe(addr, addr.length)
    let hex: string
    if (addrBech32) {
      hex = Buffer.from(bech32.fromWords(addrBech32.words)).toString('hex')
    } else if (await wasm.ByronAddress.isValid(addr)) {
      hex = Buffer.from(
        await wasm.ByronAddress.fromBase58(addr)
          .then((b) => b.toAddress())
          .then((a) => a.toBytes()),
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

  const addr1Hex = await addrToHex(addr1)
  const addr2Hex = await addrToHex(addr2)
  return addr1Hex === addr2Hex
}

/**
 * Transform transaction outputs to Ledger format
 */
export const transformToLedgerOutputs = async (
  wasm: WasmModuleProxy,
  request: {
    networkId: number
    txOutputs: TransactionOutputs
    changeAddrs: Array<AddressingAddress>
    stakingDerivationPath?: number[]
  },
): Promise<Array<LedgerTxOutput>> => {
  const result: LedgerTxOutput[] = []
  for (let i = 0; i < (await request.txOutputs.len()); i++) {
    const output = await request.txOutputs.get(i)
    const address = await output.address()
    const jsAddr = await toHexOrBase58(wasm, address)

    let changeAddr: AddressingAddress | null = null
    for (const change of request.changeAddrs) {
      if (await areAddressesTheSame(wasm, jsAddr, change.address)) {
        changeAddr = change
        break
      }
    }

    const dataHash = (await output.hasDataHash())
      ? ((await output.dataHash().then((x) => x?.toHex())) ?? '')
      : undefined

    if (changeAddr != null && changeAddr.addressing) {
      verifyFromBip44Root(changeAddr.addressing)
      const addressParams = await toLedgerAddressParameters(wasm, {
        networkId: request.networkId,
        address,
        path: changeAddr.addressing.path,
        stakingDerivationPath: request.stakingDerivationPath,
      })
      const outputAmount = await output.amount()
      const ledgerOutput: LedgerTxOutput = {
        amount: await output
          .amount()
          .then((x) => x.coin())
          .then((x) => x.toStr()),
        tokenBundle: await toLedgerTokenBundle(await outputAmount.multiasset()),
        datumHashHex: dataHash,
        destination: {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: addressParams,
        },
      }
      result.push(ledgerOutput)
    } else {
      const ledgerOutput: LedgerTxOutput = {
        amount: await output
          .amount()
          .then((x) => x.coin())
          .then((x) => x.toStr()),
        tokenBundle: await toLedgerTokenBundle(
          await output.amount().then((x) => x.multiasset()),
        ),
        datumHashHex: dataHash,
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: Buffer.from(await address.toBytes()).toString('hex'),
          },
        },
      }
      result.push(ledgerOutput)
    }
  }
  return result
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
export const toLedgerAddressParameters = async (
  wasm: WasmModuleProxy,
  request: {
    networkId: number
    address: Address
    path: Array<number>
    stakingDerivationPath?: number[]
  },
): Promise<LedgerDeviceOwnedAddress> => {
  {
    const byronAddr = await wasm.ByronAddress.fromAddress(request.address)
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
    const baseAddr = await wasm.BaseAddress.fromAddress(request.address)
    if (baseAddr) {
      if (!request.stakingDerivationPath) {
        const stakeCred = await baseAddr.stakeCred()
        const wasmHash =
          (await stakeCred.toKeyhash()) ?? (await stakeCred.toScripthash())
        if (!wasmHash) {
          throw new Error(`toLedgerAddressParameters unknown hash type`)
        }
        const hashInAddress = Buffer.from(await wasmHash.toBytes()).toString(
          'hex',
        )

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
    const ptrAddr = await wasm.PointerAddress.fromAddress(request.address)
    if (ptrAddr) {
      const pointer = await ptrAddr.stakePointer()
      return {
        type: LedgerAddressType.POINTER_KEY,
        params: {
          spendingPath: request.path,
          stakingBlockchainPointer: {
            blockIndex: await pointer.slot(),
            txIndex: await pointer.txIndex(),
            certificateIndex: await pointer.certIndex(),
          },
        },
      }
    }
  }
  {
    const enterpriseAddr = await wasm.EnterpriseAddress.fromAddress(
      request.address,
    )
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
    const rewardAddr = await wasm.RewardAddress.fromAddress(request.address)
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
export const toLedgerTokenBundle = async (
  assets: MultiAsset | undefined | null,
): Promise<Array<LedgerAssetGroup> | null> => {
  if (assets === null || !assets) return null
  const assetGroup: Array<LedgerAssetGroup> = []

  const policyHashes = await assets.keys()
  for (let i = 0; i < (await policyHashes.len()); i++) {
    const policyId = await policyHashes.get(i)
    const assetsForPolicy = await assets.get(policyId)
    if (!assetsForPolicy) continue

    const tokens: Array<LedgerToken> = []
    const assetNames = await assetsForPolicy.keys()
    for (let j = 0; j < (await assetNames.len()); j++) {
      const assetName = await assetNames.get(j)
      const amount = await assetsForPolicy.get(assetName)
      if (!amount) continue

      tokens.push({
        amount: await amount.toStr(),
        assetNameHex: Buffer.from(await assetName.name()).toString('hex'),
      })
    }
    // sort by asset name to the order specified by rfc7049
    tokens.sort((token1, token2) =>
      compareCborKey(token1.assetNameHex, token2.assetNameHex),
    )
    assetGroup.push({
      policyIdHex: Buffer.from(await policyId.toBytes()).toString('hex'),
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
export const formatLedgerCertificates = async (
  certificates: Certificates,
  stakingDerivationPath: number[],
): Promise<Array<LedgerCertificate>> => {
  const result: Array<LedgerCertificate> = []
  for (let i = 0; i < (await certificates.len()); i++) {
    const cert = await certificates.get(i)

    const registrationCert = await cert.asStakeRegistration()
    if (registrationCert != null && (await registrationCert).hasValue()) {
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
    const deregistrationCert = await cert.asStakeDeregistration()
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
    const delegationCert = await cert.asStakeDelegation()
    if (delegationCert != null && delegationCert.hasValue()) {
      result.push({
        type: LedgerCertificateType.STAKE_DELEGATION,
        params: {
          stakeCredential: {
            type: LedgerCredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
          poolKeyHashHex: Buffer.from(
            await delegationCert.poolKeyhash().then((x) => x.toBytes()),
          ).toString('hex'),
        },
      })
      continue
    }
    const voteDelegationCert = await cert.asVoteDelegation()
    if (voteDelegationCert != null) {
      const drepParams = await mapDrepParams(voteDelegationCert)
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

const mapDrepParams = async (certificate: {
  drep(): Promise<{
    kind(): Promise<number>
    toKeyHash(): Promise<{toBytes(): Promise<Uint8Array>} | null> | null
    toScriptHash(): Promise<{toBytes(): Promise<Uint8Array>} | null> | null
  }>
}): Promise<LedgerDRepParams | undefined> => {
  const drep = await certificate.drep()
  const drepKind = await drep.kind()

  // DRepKind enum values from @emurgo/cross-csl-core
  const DRepKind = {
    KeyHash: 0,
    ScriptHash: 1,
    AlwaysAbstain: 2,
    AlwaysNoConfidence: 3,
  }

  if (drepKind === DRepKind.KeyHash) {
    const keyHash = await drep.toKeyHash()
    const keyHashBytes = await keyHash?.toBytes()

    if (keyHashBytes)
      return {
        type: LedgerDRepParamsType.KEY_HASH,
        keyHashHex: Buffer.from(keyHashBytes).toString('hex'),
      }

    throw new Error('mapDrepParams invalid keyHashBytes')
  }

  if (drepKind === DRepKind.ScriptHash) {
    const scriptHash = await drep.toScriptHash()
    const scriptHashBytes = await scriptHash?.toBytes()

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
export const formatLedgerWithdrawals = async (
  withdrawals: Withdrawals,
  stakingDerivationPath: number[],
): Promise<Array<LedgerWithdrawal>> => {
  const result: Array<LedgerWithdrawal> = []

  const withdrawalKeys = await withdrawals.keys()
  for (let i = 0; i < (await withdrawalKeys.len()); i++) {
    const rewardAddress = await withdrawalKeys.get(i)
    const withdrawalAmount = await withdrawals.get(rewardAddress)
    if (withdrawalAmount === null || !withdrawalAmount) {
      throw new Error(`formatLedgerWithdrawals should never happen`)
    }

    result.push({
      amount: await withdrawalAmount.toStr(),
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
async function toHexOrBase58(
  wasm: WasmModuleProxy,
  address: Address,
): Promise<string> {
  const asByron = await wasm.ByronAddress.fromAddress(address)
  if (asByron === null || !asByron) {
    return Buffer.from(await address.toBytes()).toString('hex')
  }
  return await asByron.toBase58()
}

/**
 * Assert that transaction sets have proper tag state for Ledger signing
 */
export const assertTagsState = async (
  wasm: WasmModuleProxy,
  txHex: string,
): Promise<void> => {
  const tagsState = await wasm.hasTransactionSetTag(Buffer.from(txHex, 'hex'))

  if (tagsState === wasm.TransactionSetsState.MixedSets) {
    throw new Error('Transaction with mixed sets cannot be signed by Ledger')
  }
}

/**
 * Check if all transaction sets have tags
 */
export const doAllSetsHaveTag = async (
  wasm: WasmModuleProxy,
  txHex: string,
): Promise<boolean> => {
  const tagsState = await wasm.hasTransactionSetTag(Buffer.from(txHex, 'hex'))
  return tagsState === wasm.TransactionSetsState.AllSetsHaveTag
}
