import {ADDRESS_TYPE_TO_CHANGE, AddressType, CardanoMobile} from '..'
import {
  CHAIN_DERIVATIONS,
  CHAIN_NETWORK_ID,
  CIP1852,
  COIN_TYPE,
  HARD_DERIVATION_START,
  STAKING_KEY_INDEX,
} from '../../networks/mainnet/protocol'

export const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')

export const deriveStakingKey = async (accountPubKeyHex: string) => {
  const accountPubKey = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await accountPubKey
    .derive(CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
    .then((key) => key.derive(STAKING_KEY_INDEX))
    .then((key) => key.toRawKey())

  return stakingKey
}

export const deriveKeys = async (decryptedMasterKey: string) => {
  const masterKey = await CardanoMobile.Bip32PrivateKey.fromBytes(Buffer.from(decryptedMasterKey, 'hex'))
  const accountPrivateKey = await masterKey
    .derive(CIP1852)
    .then((key) => key.derive(COIN_TYPE))
    .then((key) => key.derive(0 + HARD_DERIVATION_START))
  const accountPrivateKeyHex = await accountPrivateKey.asBytes().then(toHex)
  const stakingPrivateKey = await accountPrivateKey
    .derive(CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)
    .then((key) => key.derive(STAKING_KEY_INDEX))
    .then((key) => key.toRawKey())

  return {
    accountPrivateKeyHex,
    stakingPrivateKey,
  }
}

export const deriveRewardAddressHex = async (accountPubKeyHex: string) => {
  const accountPubKeyPtr = await CardanoMobile.Bip32PublicKey.fromBytes(Buffer.from(accountPubKeyHex, 'hex'))
  const stakingKey = await (
    await (await accountPubKeyPtr.derive(CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT)).derive(STAKING_KEY_INDEX)
  ).toRawKey()
  const credential = await CardanoMobile.StakeCredential.fromKeyhash(await stakingKey.hash())
  const rewardAddr = await CardanoMobile.RewardAddress.new(CHAIN_NETWORK_ID, credential)
  const rewardAddrAsAddr = await rewardAddr.toAddress()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Buffer.from((await rewardAddrAsAddr.toBytes()) as any, 'hex').toString('hex')
}

export const formatPathCip1852 = (account: number, type: AddressType, index: number) => {
  const purpose = CIP1852 - HARD_DERIVATION_START
  const COIN = COIN_TYPE - HARD_DERIVATION_START

  return `m/${purpose}'/${COIN}'/${account}'/${ADDRESS_TYPE_TO_CHANGE[type]}/${index}`
}

export type AddressValidationErrors = {
  addressIsRequired?: boolean
  invalidAddress?: boolean
  unsupportedDomain?: boolean
  recordNotFound?: boolean
  unregisteredDomain?: boolean
}

export const isReceiverAddressValid = async (receiverAddress: string): Promise<AddressValidationErrors> => {
  if (receiverAddress === "") {
    return {addressIsRequired: true}
  }

  const address = await normalizeToAddress(receiverAddress)
  if (!address) {
    return {invalidAddress: true}
  }

  try {
    const addressNetworkId = await address.networkId()
    if (addressNetworkId !== CHAIN_NETWORK_ID) {
      return {invalidAddress: true}
    }
  } catch (e) {
    // NOTE: should not happen
    return {invalidAddress: true}
  }

  return {}
}

export const normalizeToAddress = async (addr: string) => {
  // in Shelley, addresses can be base16, bech32 or base58
  // in this function, we try parsing in all encodings possible
  // 1) Try converting from base58
  try {
    if (await CardanoMobile.ByronAddress.isValid(addr)) {
      return await (await CardanoMobile.ByronAddress.fromBase58(addr)).toAddress()
    }
  // eslint-disable-next-line no-empty
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 2) If already base16, simply return
  try {
    return await CardanoMobile.Address.fromBytes(Buffer.from(addr, 'hex'))
  // eslint-disable-next-line no-empty
  } catch (_e) {}

  // eslint-disable-line no-empty
  // 3) Try converting from bech32
  try {
    return await CardanoMobile.Address.fromBech32(addr)
  // eslint-disable-next-line no-empty
  } catch (_e) {}

  // eslint-disable-line no-empty
  return undefined
}
