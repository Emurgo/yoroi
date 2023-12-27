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
import {Resolver} from '@yoroi/types'

export const resolveDomain = async (
  cnsName: string,
  cnsPolicyId: string,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string | null> => {
  try {
    const assetName = stringToHex(cnsName)
    const assetHex = `${cnsPolicyId}${assetName}`

    const metadata = await getMetadata(
      cnsPolicyId,
      assetName,
      baseUrl,
      fetcherConfig,
    )

    if (!metadata) return null
    if (!validateExpiry(metadata)) throw new Resolver.Errors.ExpiredDomain()

    const address = await getAssetAddress(assetHex, baseUrl, fetcherConfig)
    if (!address) return null

    return address
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

const resolveUserRecord = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
  csl?: WasmModuleProxy,
): Promise<ParsedCNSUserRecord | string> => {
  try {
    if (!csl) throw new Error('csl needed')
    const assetName = stringToHex(cnsName)

    const metadata = await getMetadata(
      cnsPolicyId,
      assetName,
      baseUrl,
      fetcherConfig,
    )
    if (!metadata) throw new Resolver.Errors.NotFound()
    if (!validateExpiry(metadata)) throw new Resolver.Errors.ExpiredDomain()

    const recordAssetHex = `${recordPolicyId}${assetName}`
    const inlineDatum = await getAssetInlineDatum(
      [recordAddress],
      recordAssetHex,
      baseUrl,
      fetcherConfig,
    )

    if (!inlineDatum) throw new Resolver.Errors.NotFound()
    if (!validateCNSUserRecord(inlineDatum))
      throw new Resolver.Errors.InvalidResponse()
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
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

const resolveVirtualSubdomains = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
  csl?: WasmModuleProxy,
): Promise<string[][] | string> => {
  try {
    const parsedUserRecord = await resolveUserRecord(
      cnsName,
      cnsPolicyId,
      recordPolicyId,
      recordAddress,
      networkId,
      baseUrl,
      fetcherConfig,
      csl,
    )
    if (typeof parsedUserRecord === 'string') return parsedUserRecord
    return parsedUserRecord.virtualSubdomains
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

export const resolveVirtualSubdomain = async (
  virtualDomain: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
  csl?: WasmModuleProxy,
): Promise<string | undefined> => {
  try {
    const [target, cnsName, ext] = virtualDomain.split('.')

    const virtualDomains = await resolveVirtualSubdomains(
      `${cnsName}.${ext}`,
      cnsPolicyId,
      recordPolicyId,
      recordAddress,
      networkId,
      baseUrl,
      fetcherConfig,
      csl,
    )
    if (typeof virtualDomains === 'string') return virtualDomains

    const resolvedVirtualDomain = virtualDomains?.find(
      ([key]) => key === target,
    )
    if (!resolvedVirtualDomain) throw new Resolver.Errors.NotFound()

    return resolvedVirtualDomain[1]
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

export const resolveAddress = async (
  cnsName: string,
  cnsPolicyId: string,
  recordPolicyId: string,
  recordAddress: string,
  networkId: number,
  baseUrl: string,
  fetcherConfig?: AxiosRequestConfig,
  csl?: WasmModuleProxy,
): Promise<string | null> => {
  try {
    let address
    const deconstructedCns = cnsName.split('.')

    if (deconstructedCns.length === 2) {
      address = await resolveDomain(
        cnsName,
        cnsPolicyId,
        baseUrl,
        fetcherConfig,
      )
    }

    if (deconstructedCns.length === 3) {
      address = await resolveVirtualSubdomain(
        cnsName,
        cnsPolicyId,
        recordPolicyId,
        recordAddress,
        networkId,
        baseUrl,
        fetcherConfig,
        csl,
      )
    }

    if (!address) return null
    return address
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}
