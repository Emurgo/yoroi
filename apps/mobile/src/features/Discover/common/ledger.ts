import {
  AddressType,
  AssetGroup,
  CertificateType,
  CredentialParamsType,
  Datum,
  DatumType,
  DRepParams,
  DRepParamsType,
  Certificate as LedgerCertificate,
  RequiredSigner,
  SignTransactionRequest,
  Token,
  TransactionSigningMode,
  TxAuxiliaryData,
  TxAuxiliaryDataType,
  TxInput,
  TxOutput,
  TxOutputDestination,
  TxOutputDestinationType,
  TxOutputFormat,
  TxRequiredSignerType,
  Withdrawal,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {
  Certificates,
  DRepKind,
  MultiAsset,
  TransactionInputs,
  TransactionOutput,
  VoteDelegation,
  WasmModuleProxy,
  Withdrawals,
} from '@emurgo/cross-csl-core'
import {CardanoAddressedUtxo} from '@emurgo/yoroi-lib'
import {decode} from 'cbor2'

function toLedgerTokenBundle(assets?: MultiAsset): Array<AssetGroup> | null {
  if (assets == null) return null
  const assetGroup: Array<AssetGroup> = []

  const policyHashes = assets.keys()
  for (let i = 0; i < policyHashes.len(); i++) {
    const policyId = policyHashes.get(i)
    const assetsForPolicy = assets.get(policyId)
    if (assetsForPolicy == null) continue

    const tokens: Array<Token> = []
    const assetNames = assetsForPolicy.keys()
    for (let j = 0; j < assetNames.len(); j++) {
      const assetName = assetNames.get(j)
      const amount = assetsForPolicy.get(assetName)
      if (amount == null) continue

      tokens.push({
        amount: amount.toStr(),
        assetNameHex: Buffer.from(assetName.name()).toString('hex'),
      })
    }
    tokens.sort((token1, token2) =>
      compareCborKey(token1.assetNameHex, token2.assetNameHex),
    )
    assetGroup.push({
      policyIdHex: Buffer.from(policyId.toBytes()).toString('hex'),
      tokens,
    })
  }
  assetGroup.sort((asset1, asset2) =>
    compareCborKey(asset1.policyIdHex, asset2.policyIdHex),
  )
  return assetGroup
}

function compareCborKey(hex1: string, hex2: string): number {
  if (hex1.length < hex2.length) return -1
  if (hex1.length > hex2.length) return 1
  if (hex1 < hex2) return -1
  if (hex1 > hex2) return 1
  return 0
}

function formatLedgerWithdrawals(
  withdrawals: Withdrawals,
  addressingMap: AddressingMap,
): Array<Withdrawal> {
  const result: Array<Withdrawal> = []

  const keys = withdrawals.keys()
  const keysLength = keys.len()
  for (let i = 0; i < keysLength; i++) {
    const rewardAddress = keys.get(i)
    const withdrawalAmount = withdrawals.get(rewardAddress)
    if (withdrawalAmount == null) {
      throw new Error(`formatLedgerWithdrawals should never happen`)
    }
    const rewardAddressPayload = rewardAddress.toAddress().toHex()
    const addressing = addressingMap(rewardAddressPayload)
    let stakeCredential: null | Withdrawal['stakeCredential'] = null
    if (addressing != null) {
      stakeCredential = {
        type: CredentialParamsType.KEY_PATH,
        keyPath: addressing.path,
      }
    } else {
      const cred = rewardAddress.paymentCred()
      const maybeKeyHash = cred.toKeyhash()
      const maybeScriptHash = cred.toScripthash()
      if (maybeKeyHash) {
        stakeCredential = {
          type: CredentialParamsType.KEY_HASH,
          keyHashHex: maybeKeyHash.toHex(),
        }
      } else if (maybeScriptHash) {
        stakeCredential = {
          type: CredentialParamsType.SCRIPT_HASH,
          scriptHashHex: maybeScriptHash.toHex(),
        }
      }
    }
    if (stakeCredential === null) {
      throw new Error(
        'Failed to resolve credential type for reward address: ' +
          rewardAddressPayload,
      )
    }
    result.push({
      amount: withdrawalAmount.toStr(),
      stakeCredential,
    })
  }

  return result
}

export const formatLedgerCertificates = (
  certificates: Certificates,
  stakingDerivationPath: number[],
): Array<LedgerCertificate> => {
  const result: Array<LedgerCertificate> = []
  for (let i = 0; i < certificates.len(); i++) {
    const cert = certificates.get(i)

    const registrationCert = cert.asStakeRegistration()
    if (registrationCert != null && registrationCert.hasValue()) {
      result.push({
        type: CertificateType.STAKE_REGISTRATION,
        params: {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
        },
      })
      continue
    }
    const deregistrationCert = cert.asStakeDeregistration()
    if (deregistrationCert != null && deregistrationCert.hasValue()) {
      result.push({
        type: CertificateType.STAKE_DEREGISTRATION,
        params: {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
            keyPath: stakingDerivationPath,
          },
        },
      })
      continue
    }
    const delegationCert = cert.asStakeDelegation()
    if (delegationCert != null && delegationCert.hasValue()) {
      result.push({
        type: CertificateType.STAKE_DELEGATION,
        params: {
          stakeCredential: {
            type: CredentialParamsType.KEY_PATH,
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
    if (voteDelegationCert != null && voteDelegationCert.hasValue()) {
      const drepParams = mapDrepParams(voteDelegationCert)
      if (drepParams) {
        result.push({
          type: CertificateType.VOTE_DELEGATION,
          params: {
            stakeCredential: {
              type: CredentialParamsType.KEY_PATH,
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

const mapDrepParams = (certificate: VoteDelegation): DRepParams | undefined => {
  const drep = certificate.drep()
  const drepKind = drep.kind()

  if (drepKind === DRepKind.KeyHash) {
    const keyHash = drep.toKeyHash()
    const keyHashBytes = keyHash?.toBytes()

    if (keyHashBytes)
      return {
        type: DRepParamsType.KEY_HASH,
        keyHashHex: Buffer.from(keyHashBytes).toString('hex'),
      }

    throw new Error('mapDrepParams invalid keyHashBytes')
  }

  if (drepKind === DRepKind.ScriptHash) {
    const scriptHash = drep.toScriptHash()
    const scriptHashBytes = scriptHash?.toBytes()

    if (scriptHashBytes)
      return {
        type: DRepParamsType.SCRIPT_HASH,
        scriptHashHex: Buffer.from(scriptHashBytes).toString('hex'),
      }

    throw new Error('mapDrepParams invalid scriptHashBytes')
  }

  if (drepKind === DRepKind.AlwaysAbstain) {
    return {
      type: DRepParamsType.ABSTAIN,
    }
  }

  if (drepKind === DRepKind.AlwaysNoConfidence) {
    return {
      type: DRepParamsType.NO_CONFIDENCE,
    }
  }

  throw new Error('mapDrepParams invalid DRep Kind')
}

type AddressMap = {[addressHex: string]: Array<number>}

export async function toLedgerSignRequest(
  csl: WasmModuleProxy,
  cbor: string,
  networkId: number,
  protocolMagic: number,
  ownUtxoAddressMap: AddressMap,
  ownStakeAddressMap: AddressMap,
  addressedUtxos: Array<CardanoAddressedUtxo>,
  additionalRequiredSigners: Array<string> = [],
  stakingDerivationPath?: number[],
): Promise<SignTransactionRequest> {
  const hex = new Uint8Array(Buffer.from(cbor, 'hex'))
  const tagsState = await csl.hasTransactionSetTag(hex)

  if (tagsState === csl.TransactionSetsState.MixedSets) {
    throw new Error('Transaction with mixed sets cannot be signed by Ledger')
  }

  const txHasSetTags = tagsState === csl.TransactionSetsState.AllSetsHaveTag

  function formatInputs(inputs: TransactionInputs): Array<TxInput> {
    const formatted = []
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i)
      const hash = input.transactionId().toHex()
      const index = input.index()
      const ownUtxo = addressedUtxos.find(
        (utxo) => utxo.txHash === hash && utxo.txIndex === index,
      )
      formatted.push({
        txHashHex: hash,
        outputIndex: index,
        path: ownUtxo ? ownUtxo.addressing.path : null,
      })
    }
    return formatted
  }

  function formatOutput(
    output: TransactionOutput,
    isPostAlonzoTransactionOutput: boolean,
  ): TxOutput {
    const addr = output.address()
    let destination: TxOutputDestination | null = null

    // Yoroi doesn't have Byron addresses or pointer addresses.
    // If the address is one of these, it's not a wallet address.
    const byronAddr = csl.ByronAddress.fromAddress(addr)
    const pointerAddr = csl.PointerAddress.fromAddress(addr)
    if (byronAddr || pointerAddr) {
      destination = {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex: addr.toHex(),
        },
      }
    }

    const enterpriseAddr = csl.EnterpriseAddress.fromAddress(addr)
    if (enterpriseAddr) {
      const ownAddressPath = ownUtxoAddressMap[addr.toHex()]
      if (ownAddressPath) {
        destination = {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: {
            type: AddressType.ENTERPRISE_KEY,
            params: {
              spendingPath: ownAddressPath,
            },
          },
        }
      } else {
        destination = {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: addr.toHex(),
          },
        }
      }
    }

    const baseAddr = csl.BaseAddress.fromAddress(addr)
    if (baseAddr) {
      const enterpriseAddr = csl.EnterpriseAddress.new(
        networkId,
        baseAddr.paymentCred(),
      )
      const paymentAddress = enterpriseAddr.toAddress().toHex()
      const ownPaymentPath = ownUtxoAddressMap[paymentAddress]
      if (ownPaymentPath) {
        const stake = baseAddr.stakeCred()
        const stakeAddr = csl.RewardAddress.new(networkId, stake)
          .toAddress()
          .toHex()
        const ownStakePath = ownStakeAddressMap[stakeAddr]
        if (ownStakePath) {
          // stake address is ours
          destination = {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: ownPaymentPath,
                stakingPath: ownStakePath,
              },
            },
          }
        } else {
          const keyHash = stake.toKeyhash()
          const scriptHash = stake.toScripthash()
          if (keyHash) {
            // stake address is foreign key hash
            destination = {
              type: TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
                params: {
                  spendingPath: ownPaymentPath,
                  stakingKeyHashHex: keyHash.toHex(),
                },
              },
            }
          } else if (scriptHash) {
            // stake address is script hash
            destination = {
              type: TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_SCRIPT,
                params: {
                  spendingPath: ownPaymentPath,
                  stakingScriptHashHex: scriptHash.toHex(),
                },
              },
            }
          } else {
            throw new Error('unexpected stake credential type in base address')
          }
        }
        // not having BASE_PAYMENT_SCRIPT_ because payment script is
        // treated as third party address
      } else {
        // payment address is not ours
        destination = {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: addr.toHex(),
          },
        }
      }
    }

    // we do not allow payment to RewardAddresses
    if (!destination) {
      throw new Error('not expecting to pay to reward address')
    }

    const amount = output.amount().coin().toStr()
    const tokenBundle = toLedgerTokenBundle(output.amount().multiasset())
    const outputDataHash = output.dataHash()
    const plutusData = output.plutusData()
    const scriptRef = output.scriptRef()

    if (isPostAlonzoTransactionOutput || scriptRef || plutusData) {
      let datum: Datum | null = null
      if (plutusData) {
        datum = {
          type: DatumType.INLINE,
          datumHex: plutusData.toHex(),
        }
      } else if (outputDataHash) {
        datum = {
          type: DatumType.HASH,
          datumHashHex: outputDataHash.toHex(),
        }
      }
      return {
        format: TxOutputFormat.MAP_BABBAGE,
        amount,
        destination,
        tokenBundle,
        datum,
        referenceScriptHex: scriptRef ? scriptRef.toHex() : null,
      }
    }

    return {
      format: TxOutputFormat.ARRAY_LEGACY,
      amount,
      destination,
      tokenBundle,
      datumHashHex: outputDataHash ? outputDataHash.toHex() : null,
    }
  }

  const txBody = csl.FixedTransaction.fromHex(cbor).body()
  const parsedCbor = decode(txBody.toBytes())
  const outputs: TxOutput[] = []
  const nativeOutputs = txBody.outputs()
  for (let i = 0; i < nativeOutputs.len(); i++) {
    const o = nativeOutputs.get(i)
    const isPostAlonzoTransactionOutput =
      parsedCbor.get(1)?.constructor?.name === 'Map'
    outputs.push(formatOutput(o, isPostAlonzoTransactionOutput))
  }

  function getRequiredSignerHashHexes(): Array<string> {
    const set = new Set<string>()
    const requiredSigners = txBody.requiredSigners()
    if (requiredSigners) {
      for (let i = 0; i < requiredSigners.len(); i++) {
        set.add(requiredSigners.get(i).toHex())
      }
    }
    return [...set]
  }

  const additionalWitnessPaths: number[][] = []
  const formattedRequiredSigners: RequiredSigner[] = []

  function hashHexToOwnAddressPath(hashHex: string): Array<number> | undefined {
    const hash = csl.Ed25519KeyHash.fromHex(hashHex)
    const enterpriseAddress = csl.EnterpriseAddress.new(
      networkId,
      csl.Credential.fromKeyhash(hash),
    )
      .toAddress()
      .toHex()
    const stakeAddress = csl.RewardAddress.new(
      networkId,
      csl.Credential.fromKeyhash(hash),
    )
      .toAddress()
      .toHex()
    return (
      ownUtxoAddressMap[enterpriseAddress] || ownStakeAddressMap[stakeAddress]
    )
  }

  const requiredSignerHashHexes = getRequiredSignerHashHexes()
  for (const hashHex of requiredSignerHashHexes) {
    const ownAddressPath = hashHexToOwnAddressPath(hashHex)
    if (ownAddressPath != null) {
      formattedRequiredSigners.push({
        type: TxRequiredSignerType.PATH,
        path: ownAddressPath,
      })
      additionalWitnessPaths.push(ownAddressPath)
    } else {
      formattedRequiredSigners.push({
        type: TxRequiredSignerType.HASH,
        hashHex,
      })
    }
  }

  for (const additionalHashHex of additionalRequiredSigners || []) {
    const ownAddressPath = hashHexToOwnAddressPath(additionalHashHex)
    if (ownAddressPath != null) {
      additionalWitnessPaths.push(ownAddressPath)
    }
  }

  const addressingMap: AddressingMap = (addr: string) => {
    const path = ownUtxoAddressMap[addr] || ownStakeAddressMap[addr]
    if (path) {
      return {path}
    }
    return null
  }

  let formattedCertificates: LedgerCertificate[] | null = null
  const certificates = txBody.certs()
  if (certificates && stakingDerivationPath) {
    formattedCertificates = formatLedgerCertificates(
      certificates,
      stakingDerivationPath,
    )
  }

  let formattedWithdrawals: Withdrawal[] | null = null
  const withdrawals = txBody.withdrawals()
  if (withdrawals) {
    formattedWithdrawals = formatLedgerWithdrawals(withdrawals, addressingMap)
  }

  // TODO: support CIP36 aux data
  let formattedAuxiliaryData: TxAuxiliaryData | null = null
  const auxiliaryDataHash = txBody.auxiliaryDataHash()
  if (auxiliaryDataHash) {
    formattedAuxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: auxiliaryDataHash.toHex(),
      },
    }
  }

  let formattedCollateral: TxInput[] | null = null
  const collateral = txBody.collateral()
  if (collateral) {
    formattedCollateral = formatInputs(collateral)
  }

  let formattedCollateralReturn: TxOutput | null = null
  const collateralReturn = txBody.collateralReturn()
  if (collateralReturn) {
    formattedCollateralReturn = formatOutput(
      collateralReturn,
      parsedCbor.get(16)?.constructor?.name === 'Map',
    )
  }

  let formattedReferenceInputs = null
  const referenceInputs = txBody.referenceInputs()
  if (referenceInputs) {
    formattedReferenceInputs = formatInputs(referenceInputs)
  }

  let signingMode = TransactionSigningMode.ORDINARY_TRANSACTION
  if (formattedCollateral) {
    signingMode = TransactionSigningMode.PLUTUS_TRANSACTION
  }

  return {
    signingMode,
    tx: {
      network: {
        networkId,
        protocolMagic,
      },
      inputs: formatInputs(txBody.inputs()),
      outputs,
      fee: txBody.fee().toStr(),
      ttl: txBody.ttl(),
      certificates: formattedCertificates,
      withdrawals: formattedWithdrawals,
      auxiliaryData: formattedAuxiliaryData,
      validityIntervalStart:
        txBody.validityStartIntervalBignum()?.toStr() ?? null,
      mint:
        JSON.parse(txBody.mint()?.toJson() ?? 'null')?.map(
          ([policyIdHex, assets]: [string, Record<string, string>]) => ({
            policyIdHex,
            tokens: Object.keys(assets).map((assetNameHex) => ({
              assetNameHex,
              amount: assets[assetNameHex],
            })),
          }),
        ) ?? null,
      scriptDataHashHex: txBody.scriptDataHash()?.toHex() ?? null,
      collateralInputs: formattedCollateral,
      requiredSigners:
        formattedRequiredSigners.length > 0 ? formattedRequiredSigners : null,
      includeNetworkId: txBody.networkId() != null,
      collateralOutput: formattedCollateralReturn,
      totalCollateral: txBody.totalCollateral()?.toStr() ?? null,
      referenceInputs: formattedReferenceInputs,
    },
    additionalWitnessPaths,
    options: {
      tagCborSets: txHasSetTags,
    },
  }
}

type AddressingMap = (address: string) => {path: number[]} | null
