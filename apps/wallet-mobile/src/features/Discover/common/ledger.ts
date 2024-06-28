import {
  AddressType,
  AssetGroup,
  CertificateType,
  CIP36VoteDelegationType,
  CIP36VoteRegistrationFormat,
  DatumType,
  DeviceOwnedAddress,
  SignTransactionRequest,
  StakeCredentialParamsType,
  Token,
  TransactionSigningMode,
  TxAuxiliaryDataType,
  TxInput,
  TxOutput,
  TxOutputDestinationType,
  TxOutputFormat,
  TxRequiredSignerType,
  Withdrawal,
  Witness,
  Certificate as LedgerCertificate,
  TxAuxiliaryData,
  RequiredSigner,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {
  Address,
  AuxiliaryData,
  BaseAddress,
  Bip32PublicKey,
  BootstrapWitness,
  ByronAddress,
  Certificate,
  Certificates,
  EnterpriseAddress,
  MultiAsset,
  PointerAddress,
  Transaction,
  TransactionBody,
  TransactionInputs,
  TransactionOutput,
  TransactionOutputs,
  Vkeywitness,
  WasmModuleProxy,
  Withdrawals,
  Credential,
} from '@emurgo/cross-csl-core'
import {Bip44DerivationLevels, CardanoAddressedUtxo} from '@emurgo/yoroi-lib'
import {TxOutputDestination} from '@cardano-foundation/ledgerjs-hw-app-cardano/dist/types/public'
import {ParsedDatum} from '@cardano-foundation/ledgerjs-hw-app-cardano/dist/types/internal'

export async function createLedgerSignTxPayload(request: {
  csl: WasmModuleProxy
  signRequest: HaskellShelleyTxSignRequest
  byronNetworkMagic: number
  networkId: number
  addressingMap: (value: string) => Addressing['addressing']
  cip36: boolean
}): Promise<SignTransactionRequest> {
  const {csl} = request
  const txBody: TransactionBody = request.signRequest.unsignedTx.build()

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(request.signRequest.senderUtxos)

  // Output
  const ledgerOutputs = await _transformToLedgerOutputs({
    csl,
    networkId: request.networkId,
    txOutputs: await txBody.outputs(),
    changeAddrs: request.signRequest.changeAddr,
    addressingMap: request.addressingMap,
  })

  // withdrawals
  const withdrawals = await txBody.withdrawals()

  const certificates = await txBody.certs()

  const ledgerWithdrawal = []
  if (withdrawals != null && (await withdrawals.len()) > 0) {
    ledgerWithdrawal.push(...(await formatLedgerWithdrawals(withdrawals, request.addressingMap)))
  }

  const ledgerCertificates: LedgerCertificate[] = []
  if (certificates != null && (await certificates.len()) > 0) {
    ledgerCertificates.push(
      ...(await formatLedgerCertificates(csl, request.networkId, certificates, request.addressingMap)),
    )
  }

  const ttl = txBody.ttl()

  let auxiliaryData = undefined
  if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
    const {votingPublicKey, stakingKeyPath, nonce, paymentKeyPath} =
      request.signRequest.ledgerNanoCatalystRegistrationTxSignData

    if (request.cip36) {
      auxiliaryData = {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_36,
          delegations: [
            {
              type: CIP36VoteDelegationType.KEY,
              voteKeyHex: votingPublicKey.replace(/^0x/, ''),
              weight: 1,
            },
          ],
          stakingPath: stakingKeyPath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: paymentKeyPath,
                stakingPath: stakingKeyPath,
              },
            },
          },
          nonce,
          votingPurpose: 0,
        },
      }
    } else {
      auxiliaryData = {
        type: TxAuxiliaryDataType.CIP36_REGISTRATION,
        params: {
          format: CIP36VoteRegistrationFormat.CIP_15,
          voteKeyHex: votingPublicKey.replace(/^0x/, ''),
          stakingPath: stakingKeyPath,
          paymentDestination: {
            type: TxOutputDestinationType.DEVICE_OWNED,
            params: {
              type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
              params: {
                spendingPath: paymentKeyPath,
                stakingPath: stakingKeyPath,
              },
            },
          },
          nonce,
        },
      }
    }
  } else if (request.signRequest.metadata != null) {
    auxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: Buffer.from(await (await csl.hashAuxiliaryData(request.signRequest.metadata)).toBytes()).toString(
          'hex',
        ),
      },
    }
  }

  return {
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    tx: {
      inputs: ledgerInputs,
      outputs: ledgerOutputs,
      ttl: ttl === undefined ? ttl : ttl.toString(),
      fee: await txBody.fee().then((f) => f.toStr()),
      network: {
        networkId: request.networkId,
        protocolMagic: request.byronNetworkMagic,
      },
      withdrawals: ledgerWithdrawal.length === 0 ? null : ledgerWithdrawal,
      certificates: ledgerCertificates.length === 0 ? null : ledgerCertificates,
      auxiliaryData,
      validityIntervalStart: undefined,
    },
    additionalWitnessPaths: [],
  }
}

/**
 * Canonical inputs sorting: by tx hash and then by index
 */
function compareInputs(a: TxInput, b: TxInput): number {
  if (a.txHashHex !== b.txHashHex) {
    return a.txHashHex < b.txHashHex ? -1 : 1
  }
  return a.outputIndex - b.outputIndex
}
function _transformToLedgerInputs(inputs: Array<CardanoAddressedUtxo>): Array<TxInput> {
  for (const input of inputs) {
    verifyFromDerivationRoot(input.addressing)
  }
  return inputs
    .map((input) => ({
      txHashHex: input.txHash,
      outputIndex: input.txIndex,
      path: input.addressing.path,
    }))
    .sort(compareInputs)
}

async function toLedgerTokenBundle(assets?: MultiAsset): Promise<Array<AssetGroup> | null> {
  if (assets == null) return null
  const assetGroup: Array<AssetGroup> = []

  const policyHashes = await assets.keys()
  for (let i = 0; i < (await policyHashes.len()); i++) {
    const policyId = await policyHashes.get(i)
    const assetsForPolicy = await assets.get(policyId)
    if (assetsForPolicy == null) continue

    const tokens: Array<Token> = []
    const assetNames = await assetsForPolicy.keys()
    for (let j = 0; j < (await assetNames.len()); j++) {
      const assetName = await assetNames.get(j)
      const amount = await assetsForPolicy.get(assetName)
      if (amount == null) continue

      tokens.push({
        amount: await amount.toStr(),
        assetNameHex: Buffer.from(await assetName.name()).toString('hex'),
      })
    }
    // sort by asset name to the order specified by rfc7049
    tokens.sort((token1, token2) => compareCborKey(token1.assetNameHex, token2.assetNameHex))
    assetGroup.push({
      policyIdHex: Buffer.from(await policyId.toBytes()).toString('hex'),
      tokens,
    })
  }
  // sort by policy id to the order specified by rfc7049
  assetGroup.sort((asset1, asset2) => compareCborKey(asset1.policyIdHex, asset2.policyIdHex))
  return assetGroup
}

/*
 Compare two hex string keys according to the key order specified by RFC 7049:
  *  If two keys have different lengths, the shorter one sorts
     earlier;

  *  If two keys have the same length, the one with the lower value
     in (byte-wise) lexical order sorts earlier.
*/
function compareCborKey(hex1: string, hex2: string): number {
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

async function _transformToLedgerOutputs(request: {
  csl: WasmModuleProxy
  networkId: number
  txOutputs: TransactionOutputs
  changeAddrs: Array<Addressing>
  addressingMap: AddressingMap
}): Promise<Array<TxOutput>> {
  const result: Array<TxOutput> = []

  for (let i = 0; i < (await request.txOutputs.len()); i++) {
    const output = await request.txOutputs.get(i)
    const address = await output.address()
    const jsAddr = toHexOrBase58(output.address())

    const changeAddr = request.changeAddrs.find((change) => jsAddr === change.address)
    if (changeAddr != null) {
      verifyFromDerivationRoot(changeAddr.addressing)
      const addressParams = toLedgerAddressParameters({
        csl: request.csl,
        networkId: request.networkId,
        address,
        path: changeAddr.addressing.path,
        addressingMap: request.addressingMap,
      })
      result.push({
        amount: await output
          .amount()
          .then((a) => a.coin())
          .then((c) => c.toStr()),
        tokenBundle: await toLedgerTokenBundle(await output.amount().then((a) => a.multiasset())),
        destination: {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: addressParams,
        },
      })
    } else {
      result.push({
        amount: await output
          .amount()
          .then((a) => a.coin())
          .then((c) => c.toStr()),
        tokenBundle: await toLedgerTokenBundle(await output.amount().then((a) => a.multiasset())),
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: Buffer.from(await address.toBytes()).toString('hex'),
          },
        },
      })
    }
  }
  return result
}

async function formatLedgerWithdrawals(
  withdrawals: Withdrawals,
  addressingMap: AddressingMap,
): Promise<Array<Withdrawal>> {
  const result: Array<Withdrawal> = []

  const withdrawalKeys = await withdrawals.keys()
  for (let i = 0; i < (await withdrawalKeys.len()); i++) {
    const rewardAddress = await withdrawalKeys.get(i)
    const withdrawalAmount = await withdrawals.get(rewardAddress)
    if (withdrawalAmount == null) {
      throw new Error(`formatLedgerWithdrawals should never happen`)
    }

    const rewardAddressPayload = Buffer.from(await rewardAddress.toAddress().then((a) => a.toBytes())).toString('hex')
    const addressing = addressingMap(rewardAddressPayload)
    if (addressing == null) {
      throw new Error(`formatLedgerWithdrawals Ledger can only withdraw from own address ${rewardAddressPayload}`)
    }
    result.push({
      amount: await withdrawalAmount.toStr(),
      stakeCredential: {
        type: StakeCredentialParamsType.KEY_PATH,
        keyPath: addressing.path,
      },
    })
  }
  return result
}
async function formatLedgerCertificates(
  csl: WasmModuleProxy,
  networkId: number,
  certificates: Certificates,
  addressingMap: AddressingMap,
): Promise<Array<LedgerCertificate>> {
  const getPath = async (stakeCredential: Credential): Promise<Array<number>> => {
    const rewardAddr = await csl.RewardAddress.new(networkId, stakeCredential)
    const addressPayload = Buffer.from(await rewardAddr.toAddress().then((a) => a.toBytes())).toString('hex')
    const addressing = addressingMap(addressPayload)
    if (addressing == null) {
      throw new Error(`getPath Ledger only supports certificates from own address ${addressPayload}`)
    }
    return addressing.path
  }

  const result: Array<LedgerCertificate> = []
  for (let i = 0; i < (await certificates.len()); i++) {
    const cert = await certificates.get(i)

    const registrationCert = await cert.asStakeRegistration()
    if (registrationCert != null) {
      result.push({
        type: CertificateType.STAKE_REGISTRATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: await getPath(await registrationCert.stakeCredential()),
          },
        },
      })
      continue
    }
    const deregistrationCert = await cert.asStakeDeregistration()
    if (deregistrationCert != null) {
      result.push({
        type: CertificateType.STAKE_DEREGISTRATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: await getPath(await deregistrationCert.stakeCredential()),
          },
        },
      })
      continue
    }
    const delegationCert = await cert.asStakeDelegation()
    if (delegationCert != null) {
      result.push({
        type: CertificateType.STAKE_DELEGATION,
        params: {
          stakeCredential: {
            type: StakeCredentialParamsType.KEY_PATH,
            keyPath: await getPath(await delegationCert.stakeCredential()),
          },
          poolKeyHashHex: Buffer.from(await delegationCert.poolKeyhash().then((k) => k.toBytes())).toString('hex'),
        },
      })
      continue
    }
    throw new Error(`formatLedgerCertificates Ledger doesn't support this certificate type`)
  }
  return result
}

export async function toLedgerAddressParameters(request: {
  csl: WasmModuleProxy
  networkId: number
  address: Address
  path: Array<number>
  addressingMap: AddressingMap
}): Promise<DeviceOwnedAddress> {
  const {csl} = request
  {
    const byronAddr = await csl.ByronAddress.fromAddress(request.address)
    if (byronAddr) {
      return {
        type: AddressType.BYRON,
        params: {
          spendingPath: request.path,
        },
      }
    }
  }
  {
    const baseAddr = await csl.BaseAddress.fromAddress(request.address)
    if (baseAddr) {
      const rewardAddr = await csl.RewardAddress.new(request.networkId, await baseAddr.stakeCred())
      const addressPayload = Buffer.from(await (await rewardAddr.toAddress()).toBytes()).toString('hex')
      const addressing = request.addressingMap(addressPayload)

      if (addressing == null) {
        const stakeCred = await baseAddr.stakeCred()
        const wasmHash = (await stakeCred.toKeyhash()) ?? (await stakeCred.toScripthash())
        if (wasmHash == null) {
          throw new Error(`toLedgerAddressParameters unknown hash type`)
        }
        const hashInAddress = Buffer.from(await wasmHash.toBytes()).toString('hex')

        return {
          // can't always know staking key path since address may not belong to the wallet
          // (mangled address)
          type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
          params: {
            spendingPath: request.path,
            stakingKeyHashHex: hashInAddress,
          },
        }
      }
      return {
        type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
        params: {
          spendingPath: request.path,
          stakingPath: addressing.path,
        },
      }
    }
  }
  {
    const ptrAddr = await csl.PointerAddress.fromAddress(request.address)
    if (ptrAddr) {
      const pointer = await ptrAddr.stakePointer()
      return {
        type: AddressType.POINTER_KEY,
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
    const enterpriseAddr = await csl.EnterpriseAddress.fromAddress(request.address)
    if (enterpriseAddr) {
      return {
        type: AddressType.ENTERPRISE_KEY,
        params: {
          spendingPath: request.path,
        },
      }
    }
  }
  {
    const rewardAddr = await csl.RewardAddress.fromAddress(request.address)
    if (rewardAddr) {
      return {
        type: AddressType.REWARD_KEY,
        params: {
          stakingPath: request.path, // reward addresses use spending path
        },
      }
    }
  }
  throw new Error(`toLedgerAddressParameters unknown address type`)
}

export async function buildSignedTransaction(
  csl: WasmModuleProxy,
  txBody: TransactionBody,
  senderUtxos: Array<CardanoAddressedUtxo>,
  witnesses: Array<Witness>,
  publicKey: Addressing & {key: Bip32PublicKey},
  metadata?: AuxiliaryData,
): Promise<Transaction> {
  const isSameArray = (array1: Array<number>, array2: Array<number>) =>
    array1.length === array2.length && array1.every((value, index) => value === array2[index])
  const findWitness = (path: Array<number>) => {
    for (const witness of witnesses) {
      if (isSameArray(witness.path, path)) {
        return witness.witnessSignatureHex
      }
    }
    throw new Error(`buildSignedTransaction no witness for ${JSON.stringify(path)}`)
  }

  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1

  const witSet = await csl.TransactionWitnessSet.new()
  const bootstrapWitnesses: Array<BootstrapWitness> = []
  const vkeys: Array<Vkeywitness> = []

  // Note: Ledger removes duplicate witnesses
  // but there may be a one-to-many relationship
  // ex: same witness is used in both a bootstrap witness and a vkey witness
  const seenVKeyWit = new Set<string>()
  const seenBootstrapWit = new Set<string>()

  for (const utxo of senderUtxos) {
    verifyFromDerivationRoot(utxo.addressing)

    const witness = findWitness(utxo.addressing.path)
    const addressKey = derivePublicByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      },
    })

    if (await csl.ByronAddress.isValid(utxo.receiver)) {
      const byronAddr = await csl.ByronAddress.fromBase58(utxo.receiver)
      const bootstrapWit = await csl.BootstrapWitness.new(
        await csl.Vkey.new(addressKey.to_raw_key()),
        await csl.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
        addressKey.chaincode(),
        await byronAddr.attributes(),
      )
      const asString = Buffer.from(await bootstrapWit.toBytes()).toString('hex')
      if (seenBootstrapWit.has(asString)) {
        continue
      }
      seenBootstrapWit.add(asString)
      bootstrapWitnesses.push(bootstrapWit)
      continue
    }

    const vkeyWit = await csl.Vkeywitness.new(
      await csl.Vkey.new(addressKey.to_raw_key()),
      await csl.Ed25519Signature.fromBytes(Buffer.from(witness, 'hex')),
    )
    const asString = Buffer.from(await vkeyWit.toBytes()).toString('hex')
    if (seenVKeyWit.has(asString)) {
      continue
    }
    seenVKeyWit.add(asString)
    vkeys.push(vkeyWit)
  }

  // add any staking key needed
  for (const witness of witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    }
    verifyFromDerivationRoot(addressing)
    if (witness.path[Bip44DerivationLevels.CHAIN.level - 1] === ChainDerivations.CHIMERIC_ACCOUNT) {
      const stakingKey = derivePublicByAddressing({
        addressing,
        startingFrom: {
          level: keyLevel,
          key: publicKey.key,
        },
      })
      const vkeyWit = await csl.Vkeywitness.new(
        await csl.Vkey.new(stakingKey.to_raw_key()),
        await csl.Ed25519Signature.fromBytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
      )
      const asString = Buffer.from(await vkeyWit.toBytes()).toString('hex')
      if (seenVKeyWit.has(asString)) {
        continue
      }
      seenVKeyWit.add(asString)
      vkeys.push(vkeyWit)
    }
  }
  if (bootstrapWitnesses.length > 0) {
    const bootstrapWitWasm = await csl.BootstrapWitnesses.new()
    for (const bootstrapWit of bootstrapWitnesses) {
      await bootstrapWitWasm.add(bootstrapWit)
    }
    await witSet.setBootstraps(bootstrapWitWasm)
  }
  if (vkeys.length > 0) {
    const vkeyWitWasm = await csl.Vkeywitnesses.new()
    for (const vkey of vkeys) {
      await vkeyWitWasm.add(vkey)
    }
    await witSet.setVkeys(vkeyWitWasm)
  }
  // TODO: handle script witnesses
  return csl.Transaction.new(txBody, witSet, metadata)
}

type AddressMap = {[addressHex: string]: Array<number>}

// Convert connector sign tx input into request to Ledger.
// Note this function has some overlaps in functionality with above functions but
// this function is more generic because above functions deal only with Yoroi
// extension "send" transactions.
export async function toLedgerSignRequest(
  csl: WasmModuleProxy,
  txBody: TransactionBody,
  networkId: number,
  protocolMagic: number,
  ownUtxoAddressMap: AddressMap,
  ownStakeAddressMap: AddressMap,
  addressedUtxos: Array<CardanoAddressedUtxo>,
  rawTxBody: Buffer,
  additionalRequiredSigners: Array<string> = [],
): Promise<SignTransactionRequest> {
  const parsedCbor = cbor.decode(rawTxBody)

  async function formatInputs(inputs: TransactionInputs): Promise<Array<TxInput>> {
    const formatted = []
    for (let i = 0; i < (await inputs.len()); i++) {
      const input = await inputs.get(i)
      const hash = await input.transactionId().then((t) => t.toHex())
      const index = await input.index()
      const ownUtxo = addressedUtxos.find((utxo) => utxo.txHash === hash && utxo.txIndex === index)
      formatted.push({
        txHashHex: hash,
        outputIndex: index,
        path: ownUtxo ? ownUtxo.addressing.path : null,
      })
    }
    return formatted
  }

  async function formatOutput(output: TransactionOutput, isPostAlonzoTransactionOutput: boolean): Promise<TxOutput> {
    const addr = await output.address()
    let destination: TxOutputDestination | null = null

    // Yoroi doesn't have Byron addresses or pointer addresses.
    // If the address is one of these, it's not a wallet address.
    const byronAddr = await csl.ByronAddress.fromAddress(addr)
    const pointerAddr = await csl.PointerAddress.fromAddress(addr)
    if (byronAddr || pointerAddr) {
      destination = {
        type: TxOutputDestinationType.THIRD_PARTY,
        params: {
          addressHex: await addr.toHex(),
        },
      }
    }

    const enterpriseAddr = await csl.EnterpriseAddress.fromAddress(addr)
    if (enterpriseAddr) {
      const ownAddressPath = ownUtxoAddressMap[await addr.toHex()]
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
            addressHex: await addr.toHex(),
          },
        }
      }
    }

    const baseAddr = await csl.BaseAddress.fromAddress(addr)
    if (baseAddr) {
      const enterpriseAddr = await csl.EnterpriseAddress.new(networkId, await baseAddr.paymentCred())
      const paymentAddress = await enterpriseAddr.toAddress().then((a) => a.toHex())
      const ownPaymentPath = ownUtxoAddressMap[paymentAddress]
      if (ownPaymentPath) {
        const stake = await baseAddr.stakeCred()
        const stakeAddr = await csl.RewardAddress.new(networkId, stake)
          .then((a) => a.toAddress())
          .then((a) => a.toHex())
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
          const keyHash = await stake.toKeyhash()
          const scriptHash = await stake.toScripthash()
          if (keyHash) {
            // stake address is foreign key hash
            destination = {
              type: TxOutputDestinationType.DEVICE_OWNED,
              params: {
                type: AddressType.BASE_PAYMENT_KEY_STAKE_KEY,
                params: {
                  spendingPath: ownPaymentPath,
                  stakingKeyHashHex: await keyHash.toHex(),
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
                  stakingScriptHashHex: await scriptHash.toHex(),
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
            addressHex: await addr.toHex(),
          },
        }
      }
    }

    // we do not allow payment to RewardAddresses
    if (!destination) {
      throw new Error('not expecting to pay to reward address')
    }

    const amount = await output
      .amount()
      .then((a) => a.coin())
      .then((c) => c.toStr())
    const tokenBundle = await toLedgerTokenBundle(await output.amount().then((a) => a.multiasset()))
    const outputDataHash = await output.dataHash()
    const plutusData = await output.plutusData()
    const scriptRef = await output.scriptRef()

    if (isPostAlonzoTransactionOutput || scriptRef || plutusData) {
      let datum: ParsedDatum | null = null
      if (plutusData) {
        datum = {
          type: DatumType.INLINE,
          datumHex: await plutusData.toHex(),
        }
      } else if (outputDataHash) {
        datum = {
          type: DatumType.HASH,
          datumHashHex: await outputDataHash.toHex(),
        }
      }
      return {
        format: TxOutputFormat.MAP_BABBAGE,
        amount,
        destination,
        tokenBundle,
        datum,
        referenceScriptHex: scriptRef ? await scriptRef.toHex() : null,
      }
    }

    return {
      format: TxOutputFormat.ARRAY_LEGACY,
      amount,
      destination,
      tokenBundle,
      datumHashHex: outputDataHash ? await outputDataHash.toHex() : null,
    }
  }

  const outputs: TxOutput[] = []
  const nativeOutputs = await txBody.outputs()
  for (let i = 0; i < (await nativeOutputs.len()); i++) {
    outputs.push(await formatOutput(await nativeOutputs.get(i), parsedCbor.get(1)[i].constructor.name === 'Map'))
  }

  async function getRequiredSignerHashHexes(): Promise<Array<string>> {
    const set = new Set<string>()
    const requiredSigners = await txBody.requiredSigners()
    if (requiredSigners) {
      for (let i = 0; i < (await requiredSigners.len()); i++) {
        set.add(await requiredSigners.get(i).then((s) => s.toHex()))
      }
    }
    return [...set]
  }

  const additionalWitnessPaths = []
  const formattedRequiredSigners: RequiredSigner[] = []

  async function hashHexToOwnAddressPath(hashHex: string): Promise<Array<number>> {
    const hash = await csl.Ed25519KeyHash.fromHex(hashHex)
    const enterpriseAddress = await csl.EnterpriseAddress.new(networkId, await csl.Credential.fromKeyhash(hash))
      .then((a) => a.toAddress())
      .then((a) => a.toHex())
    const stakeAddress = await csl.RewardAddress.new(networkId, await csl.Credential.fromKeyhash(hash))
      .then((r) => r.toAddress())
      .then((a) => a.toHex())
    return ownUtxoAddressMap[enterpriseAddress] || ownStakeAddressMap[stakeAddress]
  }

  const requiredSignerHashHexes = await getRequiredSignerHashHexes()
  for (const hashHex of requiredSignerHashHexes) {
    const ownAddressPath = await hashHexToOwnAddressPath(hashHex)
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

  function addressingMap(addr: string): {path: Array<number>} | undefined {
    const path = ownUtxoAddressMap[addr] || ownStakeAddressMap[addr]
    if (path) {
      return {path}
    }
    return undefined
  }

  let formattedCertificates: LedgerCertificate[] | null = null
  const certificates = await txBody.certs()
  if (certificates) {
    formattedCertificates = await formatLedgerCertificates(csl, networkId, certificates, addressingMap)
  }

  let formattedWithdrawals: Withdrawal[] | null = null
  const withdrawals = await txBody.withdrawals()
  if (withdrawals) {
    formattedWithdrawals = await formatLedgerWithdrawals(withdrawals, addressingMap)
  }

  // TODO: support CIP36 aux data
  let formattedAuxiliaryData: TxAuxiliaryData | null = null
  const auxiliaryDataHash = await txBody.auxiliaryDataHash()
  if (auxiliaryDataHash) {
    formattedAuxiliaryData = {
      type: TxAuxiliaryDataType.ARBITRARY_HASH,
      params: {
        hashHex: await auxiliaryDataHash.toHex(),
      },
    }
  }

  let formattedCollateral: TxInput[] | null = null
  const collateral = await txBody.collateral()
  if (collateral) {
    formattedCollateral = await formatInputs(collateral)
  }

  let formattedCollateralReturn: TxOutput | null = null
  const collateralReturn = await txBody.collateralReturn()
  if (collateralReturn) {
    formattedCollateralReturn = await formatOutput(collateralReturn, parsedCbor.get(16).constructor.name === 'Map')
  }

  let formattedReferenceInputs = null
  const referenceInputs = await txBody.referenceInputs()
  if (referenceInputs) {
    formattedReferenceInputs = await formatInputs(referenceInputs)
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
      inputs: await formatInputs(await txBody.inputs()),
      outputs,
      fee: await txBody.fee().then((f) => f.toStr()),
      ttl: await txBody.ttl(),
      certificates: formattedCertificates,
      withdrawals: formattedWithdrawals,
      auxiliaryData: formattedAuxiliaryData,
      validityIntervalStart: (await txBody.validityStartIntervalBignum().then((n) => n?.toStr())) ?? null,
      mint:
        JSON.parse((await txBody.mint().then((m) => m?.toJson())) ?? 'null')?.map(
          ([policyIdHex, assets]: [string, Record<string, string>]) => ({
            policyIdHex,
            tokens: Object.keys(assets).map((assetNameHex) => ({assetNameHex, amount: assets[assetNameHex]})),
          }),
        ) ?? null,
      scriptDataHashHex: (await txBody.scriptDataHash().then((h) => h?.toHex())) ?? null,
      collateralInputs: formattedCollateral,
      requiredSigners: formattedRequiredSigners.length > 0 ? formattedRequiredSigners : null,
      includeNetworkId: (await txBody.networkId()) != null,
      collateralOutput: formattedCollateralReturn,
      totalCollateral: (await txBody.totalCollateral().then((c) => c?.toStr())) ?? null,
      referenceInputs: formattedReferenceInputs,
    },
    additionalWitnessPaths,
  }
}

export async function buildConnectorSignedTransaction(
  csl: WasmModuleProxy,
  txBody: TransactionBody,
  witnesses: Array<Witness>,
  publicKey: Addressing & {key: Bip32PublicKey},
  metadata?: AuxiliaryData,
): Promise<Transaction> {
  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1

  const vkeyWitWasm = await csl.Vkeywitnesses.new()

  for (const witness of witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    }
    verifyFromDerivationRoot(addressing)

    const witnessKey = derivePublicByAddressing({
      addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      },
    })
    const vkeyWit = await csl.Vkeywitness.new(
      await csl.Vkey.new(witnessKey.to_raw_key()),
      await csl.Ed25519Signature.fromBytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
    )
    await vkeyWitWasm.add(vkeyWit)
  }
  const witSet = await csl.TransactionWitnessSet.new()
  await witSet.setVkeys(vkeyWitWasm)

  return await csl.Transaction.new(txBody, witSet, metadata)
}

function verifyFromDerivationRoot(request: Addressing['addressing']): void {
  const accountPosition = request.startLevel
  if (accountPosition !== Bip44DerivationLevels.PURPOSE.level) {
    throw new Error(`verifyFromDerivationRoot addressing does not start from root`)
  }
  const lastLevelSpecified = request.startLevel + request.path.length - 1
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`verifyFromDerivationRoot incorrect addressing size`)
  }
}

type AddressingMap = (address: string) => Addressing['addressing'] | null

type Addressing = {
  addressing: {
    startLevel: number
    path: number[]
  }
}
