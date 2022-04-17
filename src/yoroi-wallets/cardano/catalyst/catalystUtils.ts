import {mnemonicToEntropy} from 'bip39'
import blake2b from 'blake2b'

import {generateAdaMnemonic} from '../../../legacy/commonUtils'
import {CONFIG} from '../../../legacy/config'
import {Logger} from '../../../legacy/logging'
import {
  AuxiliaryData,
  BigNum,
  Bip32PrivateKey,
  CardanoTypes,
  encodeJsonStrToMetadatum,
  GeneralTransactionMetadata,
  MetadataJsonSchema,
  MetadataList,
  TransactionMetadatum,
} from '..'

export const CatalystLabels = Object.freeze({
  DATA: 61284,
  SIG: 61285,
})
export async function auxiliaryDataWithRegistrationMetadata(request: {
  stakePublicKey: CardanoTypes.PublicKey
  catalystPublicKey: CardanoTypes.PublicKey
  rewardAddress: CardanoTypes.Address
  absSlotNumber: number
  signer: (arg: Uint8Array) => Promise<string>
}) {
  /**
   * Catalyst follows a certain standard to prove the voting power
   * A transaction is submitted with following metadata format for the registration process
   * label: 61284
   * {
   *   1: "pubkey generated for catalyst app",
   *   2: "stake key public key",
   *   3: "reward address to receive voting rewards"
   *   4: nonce
   * }
   * label: 61285
   * {
   *   1: "signature of blake2b-256 hash of the metadata signed using stakekey"
   * }
   */

  const jsonMeta = JSON.stringify({
    1: `0x${Buffer.from(await request.catalystPublicKey.asBytes()).toString('hex')}`,
    2: `0x${Buffer.from(await request.stakePublicKey.asBytes()).toString('hex')}`,
    3: `0x${Buffer.from(await request.rewardAddress.toBytes()).toString('hex')}`,
    4: request.absSlotNumber,
  })
  const registrationData = await encodeJsonStrToMetadatum(jsonMeta, MetadataJsonSchema.BasicConversions)
  Logger.debug(jsonMeta)
  const metadata = await GeneralTransactionMetadata.new()
  await metadata.insert(await BigNum.fromStr(CatalystLabels.DATA.toString()), registrationData)

  const hashedMetadata = blake2b(256 / 8)
    .update(await metadata.toBytes())
    .digest('binary')

  const catalystSignature = await request.signer(hashedMetadata)

  await metadata.insert(
    await BigNum.fromStr(CatalystLabels.SIG.toString()),
    await encodeJsonStrToMetadatum(
      JSON.stringify({
        1: `0x${catalystSignature}`,
      }),
      MetadataJsonSchema.BasicConversions,
    ),
  )
  // This is how Ledger constructs the metadata. We must be consistent with it.
  const metadataList = await MetadataList.new()
  await metadataList.add(await TransactionMetadatum.fromBytes(await metadata.toBytes()))
  await metadataList.add(await TransactionMetadatum.newList(await MetadataList.new()))
  const auxiliary = await AuxiliaryData.fromBytes(await metadataList.toBytes())
  return auxiliary
}

export async function generatePrivateKeyForCatalyst() {
  let mnemonic
  if (CONFIG.DEBUG.PREFILL_FORMS) {
    if (!__DEV__) throw new Error('using debug data in non-dev env')
    mnemonic = CONFIG.DEBUG.MNEMONIC3
  } else {
    mnemonic = generateAdaMnemonic()
  }
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await Bip32PrivateKey.fromBip39Entropy(Buffer.from(bip39entropy, 'hex'), EMPTY_PASSWORD)

  return rootKey
}

export const isRegistrationOpen = (fundInfo?: null | {registrationStart: string; registrationEnd: string}) => {
  const now = new Date()

  if (fundInfo != null) {
    const startDate = new Date(Date.parse(fundInfo.registrationStart))
    const endDate = new Date(Date.parse(fundInfo.registrationEnd))
    if (now >= startDate && now <= endDate) {
      return true
    }
    return false
  } else {
    // if we don't get fund info from server, fallback to hardcoded dates
    const rounds = CONFIG.CATALYST.VOTING_ROUNDS
    for (const round of rounds) {
      const startDate = new Date(Date.parse(round.START_DATE))
      const endDate = new Date(Date.parse(round.END_DATE))
      if (now >= startDate && now <= endDate) {
        return true
      }
    }
    return false
  }
}
