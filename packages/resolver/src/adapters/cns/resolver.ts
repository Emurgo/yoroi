import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {AxiosRequestConfig} from 'axios'
import {
  validateCNSUserRecord,
  validateExpiry,
  validateVirtualSubdomainEnabled,
} from './utils'
import {ParsedCNSUserRecord} from './types'

import {
  hexToString,
  objToHex,
  parseAssocMap,
  parseAssocMapAsync,
  parsePlutusAddressToBech32,
  stringToHex,
} from './utils'
import {getAssetAddress, getAssetInlineDatum, getMetadata} from './fetcher'

export const resolveDomain = async (
  cnsName: string,
  cnsPolicyId: string,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<string> => {
  const assetName = stringToHex(cnsName)
  const assetHex = `${cnsPolicyId}${assetName}`

  const metadata = await getMetadata(
    cnsPolicyId,
    assetName,
    baseUrl,
    fetcherConfig,
  )

  if (!metadata) throw new Error('CNS not found')
  if (!validateExpiry(metadata)) throw new Error('CNS expired')

  const address = await getAssetAddress(assetHex, baseUrl, fetcherConfig)
  if (!address) throw new Error('CNS not found')

  return address
}

const resolveUserRecord = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  csl: WasmModuleProxy,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<ParsedCNSUserRecord | string> => {
  const assetName = stringToHex(cnsName)

  const metadata = await getMetadata(
    cnsPolicyId,
    assetName,
    baseUrl,
    fetcherConfig,
  )
  if (!metadata) throw new Error('CNS not found')
  if (!validateExpiry(metadata)) throw new Error('CNS expired')

  const recordAssetHex = `${recordPolicyId}${assetName}`
  const inlineDatum = await getAssetInlineDatum(
    [recordAddress],
    recordAssetHex,
    baseUrl,
    fetcherConfig,
  )

  if (!inlineDatum) throw new Error('User record not found')
  if (!validateCNSUserRecord(inlineDatum))
    throw new Error('Invalid user record')
  const virtualSubdomains = await parseAssocMapAsync(
    inlineDatum.fields[0],
    async (item) => {
      const itemHex = await objToHex(item, csl)
      const bech32 = await parsePlutusAddressToBech32(itemHex, csl, networkId)
      return bech32
    },
  )

  const parsedInlineDatum: ParsedCNSUserRecord = {
    virtualSubdomains: validateVirtualSubdomainEnabled(metadata)
      ? virtualSubdomains
      : [],
    socialProfiles: parseAssocMap(inlineDatum.fields[1], (item) =>
      hexToString(item.bytes),
    ),
    otherRecords: parseAssocMap(inlineDatum.fields[2], (item) =>
      hexToString(item.bytes),
    ),
  }

  return parsedInlineDatum
}

const resolveVirtualSubdomains = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  csl: WasmModuleProxy,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<string[][] | string> => {
  const parsedUserRecord = await resolveUserRecord(
    cnsName,
    cnsPolicyId,
    recordPolicyId,
    recordAddress,
    networkId,
    csl,
    baseUrl,
    fetcherConfig,
  )
  if (typeof parsedUserRecord === 'string') return parsedUserRecord
  return parsedUserRecord.virtualSubdomains
}

export const resolveVirtualSubdomain = async (
  virtualDomain: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  csl: WasmModuleProxy,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<string | undefined> => {
  const [target, cnsName, ext] = virtualDomain.split('.')

  const virtualDomains = await resolveVirtualSubdomains(
    `${cnsName}.${ext}`,
    cnsPolicyId,
    recordPolicyId,
    recordAddress,
    networkId,
    csl,
    baseUrl,
    fetcherConfig,
  )
  if (typeof virtualDomains === 'string') return virtualDomains

  const resolvedVirtualDomain = virtualDomains?.find(([key]) => key === target)
  if (!resolvedVirtualDomain) throw new Error('Virtual domain not found')

  return resolvedVirtualDomain[1]
}

export const resolveAddress = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  csl: WasmModuleProxy,
  baseUrl: string,
  fetcherConfig: AxiosRequestConfig,
): Promise<string | undefined> => {
  const deconstructedCns = cnsName.split('.')

  if (deconstructedCns.length === 2) {
    return await resolveDomain(cnsName, cnsPolicyId, baseUrl, fetcherConfig)
  }

  if (deconstructedCns.length === 3) {
    return await resolveVirtualSubdomain(
      cnsName,
      cnsPolicyId,
      recordPolicyId,
      recordAddress,
      networkId,
      csl,
      baseUrl,
      fetcherConfig,
    )
  }

  throw new Error('Invalid domain / virtual domain')
}
