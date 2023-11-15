import {generateMnemonic, mnemonicToEntropy} from 'bip39'
import blake2b from 'blake2b'

// @ts-ignore
import {randomBytes} from 'react-native-randombytes'
import {NUMBERS} from '@yoroi/wallet-mobile/src/yoroi-wallets/cardano/numbers'
import {CardanoMobile, CardanoTypes} from '../cardanoMobile'

export const CatalystLabels = {
  DATA: 61284,
  SIG: 61285,
} as const

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
    1: `0x${Buffer.from(await request.catalystPublicKey.asBytes()).toString(
      'hex',
    )}`,
    2: `0x${Buffer.from(await request.stakePublicKey.asBytes()).toString(
      'hex',
    )}`,
    3: `0x${Buffer.from(await request.rewardAddress.toBytes()).toString(
      'hex',
    )}`,
    4: request.absSlotNumber,
  })
  const registrationData = await CardanoMobile.encodeJsonStrToMetadatum(
    jsonMeta,
    1,
  )
  const metadata = await CardanoMobile.GeneralTransactionMetadata.new()
  await metadata.insert(
    await CardanoMobile.BigNum.fromStr(CatalystLabels.DATA.toString()),
    registrationData,
  )

  const hashedMetadata = blake2b(256 / 8)
    .update(await metadata.toBytes())
    .digest('binary')

  const catalystSignature = await request.signer(hashedMetadata)

  await metadata.insert(
    await CardanoMobile.BigNum.fromStr(CatalystLabels.SIG.toString()),
    await CardanoMobile.encodeJsonStrToMetadatum(
      JSON.stringify({
        1: `0x${catalystSignature}`,
      }),
      1,
    ),
  )
  // This is how Ledger constructs the metadata. We must be consistent with it.
  const metadataList = await CardanoMobile.MetadataList.new()
  await metadataList.add(
    await CardanoMobile.TransactionMetadatum.fromBytes(
      await metadata.toBytes(),
    ),
  )
  await metadataList.add(
    await CardanoMobile.TransactionMetadatum.newList(
      await CardanoMobile.MetadataList.new(),
    ),
  )
  const auxiliary = await CardanoMobile.AuxiliaryData.fromBytes(
    await metadataList.toBytes(),
  )
  return auxiliary
}

export async function generatePrivateKeyForCatalyst() {
  const mnemonic = generateAdaMnemonic()
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await CardanoMobile.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )

  return rootKey
}

export const isRegistrationOpen = (
  fundInfo?: null | {registrationStart: string; registrationEnd: string},
) => {
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
    const rounds = CATALYST.VOTING_ROUNDS
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

const MNEMONIC_STRENGTH = 160

export const generateAdaMnemonic = () =>
  generateMnemonic(MNEMONIC_STRENGTH, randomBytes)
export const generateWalletRootKey = async (mnemonic: string) => {
  const bip39entropy = mnemonicToEntropy(mnemonic)
  const EMPTY_PASSWORD = Buffer.from('')
  const rootKey = await CardanoMobile.Bip32PrivateKey.fromBip39Entropy(
    Buffer.from(bip39entropy, 'hex'),
    EMPTY_PASSWORD,
  )

  return rootKey
}

export const CATALYST = {
  MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(450),
  DISPLAYED_MIN_ADA: NUMBERS.LOVELACES_PER_ADA.times(500),
  VOTING_ROUNDS: [
    {
      ROUND: 4,
      START_DATE: '2021-06-03T19:00:00Z',
      END_DATE: '2021-06-10T19:00:00Z',
    },
  ],
}
