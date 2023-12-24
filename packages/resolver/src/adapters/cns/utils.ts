import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {AssocMap, BuiltinByteString, CNSMetadata} from './types'
import {CNSUserRecord} from './types/cnsUserRecord'

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

export const validateExpiry = async (metadata: CNSMetadata) => {
  const {expiry} = metadata
  const millisecondsNow = Date.now()
  return expiry > millisecondsNow
}

export const validateVirtualSubdomainEnabled = (metadata: CNSMetadata) => {
  const {virtualSubdomainEnabled} = metadata
  return virtualSubdomainEnabled === 'Enabled'
}

export const stringToHex = (str: string) =>
  Buffer.from(str, 'utf8').toString('hex')
export const hexToString = (hex: string) =>
  Buffer.from(hex, 'hex').toString('utf8')

export const parseAssocMap = <T>(
  assocMapVal: AssocMap<BuiltinByteString, T>,
  itemParser: (args0: T) => string,
  limit = 5,
): string[][] => {
  const parsedAssocMap: string[][] = []
  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) break
    const mapItem = assocMapVal.map[i]
    // @ts-ignore
    const key = hexToString(mapItem.k.bytes)
    // @ts-ignore
    const value = itemParser(mapItem.v)
    parsedAssocMap.push([key, value])
  }
  return parsedAssocMap
}

export const parseAssocMapAsync = async <T>(
  assocMapVal: AssocMap<BuiltinByteString, T>,
  itemParser: (args0: T) => Promise<string>,
  limit = 5,
): Promise<string[][]> => {
  const parsedAssocMap: string[][] = []
  const promises: Promise<string>[] = []
  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) break
    const mapItem = assocMapVal.map[i]
    // @ts-ignore
    promises.push(itemParser(mapItem.v))
  }
  const valueArray = await Promise.all(promises)
  for (let i = 0; i < limit; i += 1) {
    if (i >= assocMapVal.map.length) break
    const mapItem = assocMapVal.map[i]
    // @ts-ignore
    const key = hexToString(mapItem.k.bytes)
    const value = valueArray[i]
    // @ts-ignore
    parsedAssocMap.push([key, value])
  }
  return parsedAssocMap
}

export const parseInlineDatum = async <T>(
  inlineDatum: string,
  csl: WasmModuleProxy,
): Promise<T> => {
  const datum = await csl.PlutusData.fromHex(inlineDatum)
  const jsonDatum = await datum.toJson(1)
  const parsed = JSON.parse(jsonDatum)

  return parsed
}

export const hexToObj = async <T>(
  hex: string,
  csl: WasmModuleProxy,
): Promise<T> => {
  const plutusData = await csl.PlutusData.fromHex(hex)
  const plutusDataJson = await plutusData.toJson(1)

  return JSON.parse(plutusDataJson)
}

export const objToHex = async <T>(
  obj: T,
  csl: WasmModuleProxy,
): Promise<string> => {
  const plutusData = await csl.PlutusData.fromJson(JSON.stringify(obj), 1)
  const result = await plutusData?.toHex()

  return result ?? ''
}

export const addrBech32ToObj = async <T>(
  bech32: string,
  csl: WasmModuleProxy,
): Promise<T> => {
  const cslAddress = await csl.Address.fromBech32(bech32)
  const bytesAddress = await cslAddress.toBytes()
  const plutusData = await csl.PlutusData.fromBytes(bytesAddress)
  const plutusDataJson = await plutusData.toJson(1)

  return JSON.parse(plutusDataJson)
}

export const addrBech32ToHex = async (
  bech32: string,
  csl: WasmModuleProxy,
): Promise<string> => {
  const cslAddress = await csl.Address.fromBech32(bech32)
  const bytesAddress = await cslAddress.toBytes()
  const plutusData = await csl.PlutusData.fromBytes(bytesAddress)

  return plutusData.toHex()
}

export const parsePlutusAddressToBech32 = async (
  plutusHex: string,
  csl: WasmModuleProxy,
  networkId: number = 0,
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
  if (
    plutusDataStakeKeyObject.constructor === 0 &&
    plutusDataStakeKeyObject.fields.length !== 0
  ) {
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
    // @ts-ignore
    bech32Addr = await cslAddress.toBech32()
  } else {
    const cslEnterpriseAddress = await csl.EnterpriseAddress.new(
      networkId,
      cslPaymentCredential,
    )
    const cslAddress = await cslEnterpriseAddress.toAddress()
    // @ts-ignore
    bech32Addr = await cslAddress.toBech32()
  }

  return bech32Addr
}
