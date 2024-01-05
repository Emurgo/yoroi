import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Api} from '@yoroi/types'
import {AssocMap, BuiltinByteString} from './types'
import {CNSUserRecord} from './types'

export const validateCNSUserRecord = (
  cnsUserRecord: CNSUserRecord,
): boolean => {
  const constructorCorrect = cnsUserRecord.constructor === 0
  const numberOfFieldsCorrect = cnsUserRecord.fields.length === 3

  /**
   * TODO: Validate the following:
   * 1. virtualDomains is an AssocMap
   * 2. socialProfiles is an AssocMap
   * 3. otherRecords is an AssocMap
   * 4. Value of virtualDomains is an Address
   * 5. All other key value is a BuiltinByteString
   */

  return constructorCorrect && numberOfFieldsCorrect
}

export const validateExpiry = (metadata: Api.Cardano.NftMetadata) => {
  const {expiry} = metadata
  const millisecondsNow = Date.now()

  return (expiry as number) > millisecondsNow
}

export const validateVirtualSubdomainEnabled = (
  metadata: Api.Cardano.NftMetadata,
) => {
  const {virtualSubdomainEnabled} = metadata
  return virtualSubdomainEnabled === 'Enabled'
}

/* istanbul ignore next */
export const stringToHex = (str: string) =>
  Buffer.from(str, 'utf8').toString('hex')
/* istanbul ignore next */
export const hexToString = (hex: string) =>
  Buffer.from(hex, 'hex').toString('utf8')

export const parseAssocMapAsync = async <T>(
  assocMapVal: AssocMap<BuiltinByteString, T>,
  itemParser: (args0: T) => Promise<string>,
  limit = 5,
): Promise<string[][]> => {
  const parsedAssocMap: string[][] = []
  const promises: Promise<string>[] = []

  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) continue
    const mapItem = assocMapVal.map[i]
    if (!mapItem) throw new Error('bad data')
    promises.push(itemParser(mapItem.v))
  }

  const valueArray = await Promise.all(promises)
  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) continue
    const mapItem = assocMapVal.map[i]
    // fixed in ts 5
    /* istanbul ignore next */
    if (!mapItem) throw new Error('bad data')
    const key = hexToString(mapItem.k.bytes)
    const value = valueArray[i]
    if (!value) throw new Error('bad data')
    parsedAssocMap.push([key, value])
  }
  return parsedAssocMap
}

export const objToHex = async <T>(
  obj: T,
  csl: WasmModuleProxy,
): Promise<string> => {
  const plutusData = await csl.PlutusData.fromJson(JSON.stringify(obj), 1)
  const result = await plutusData.toHex()
  return result
}

export const parsePlutusAddressToBech32 = async (
  plutusHex: string,
  csl: WasmModuleProxy,
  networkId: number,
): Promise<string> => {
  const cslPlutusDataAddress = await csl.PlutusData.fromHex(plutusHex)
  const plutusDataAddressJson = await cslPlutusDataAddress.toJson(1)
  const plutusDataAddressObject = JSON.parse(plutusDataAddressJson)
  const plutusDataPaymentKeyObject = plutusDataAddressObject.fields[0]
  const plutusDataStakeKeyObject = plutusDataAddressObject.fields[1]
  const cslPaymentKeyHash = plutusDataPaymentKeyObject.fields[0].bytes

  // Take into account whether the hash is a PubKeyHash or ScriptHash
  const credentialKeyHashBytes = Buffer.from(cslPaymentKeyHash, 'hex')
  const pubKeyCredentialKeyHash = await csl.Ed25519KeyHash.fromBytes(
    credentialKeyHashBytes,
  )
  const pubKeyCredential = await csl.Credential.fromKeyhash(
    pubKeyCredentialKeyHash,
  )
  const scriptCredentialKeyHash = await csl.ScriptHash.fromBytes(
    credentialKeyHashBytes,
  )
  const scriptCredential = await csl.Credential.fromScripthash(
    scriptCredentialKeyHash,
  )
  const cslPaymentCredential =
    plutusDataPaymentKeyObject.constructor === 0
      ? pubKeyCredential
      : scriptCredential
  let bech32Addr = ''

  // Parsing address according to whether it has a stake key
  const cslStakeKeyHash = await csl.Ed25519KeyHash.fromBytes(
    Buffer.from(
      plutusDataStakeKeyObject.fields[0].fields[0].fields[0].bytes,
      'hex',
    ),
  )
  const stakeCredential = await csl.Credential.fromKeyhash(cslStakeKeyHash)
  const cslBaseAddress = await csl.BaseAddress.new(
    networkId,
    cslPaymentCredential,
    stakeCredential,
  )
  const cslAddress = await cslBaseAddress.toAddress()

  bech32Addr = await cslAddress.toBech32(undefined)

  return bech32Addr
}
