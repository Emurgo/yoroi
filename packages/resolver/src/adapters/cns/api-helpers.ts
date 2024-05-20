import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'

import {CnsApiConfig} from './api'
import {CnsCardanoApi} from './cardano-api-maker'
import {ParsedCNSUserRecord} from './types'
import {
  objToHex,
  parseAssocMapAsync,
  parsePlutusAddressToBech32,
  stringToHex,
  validateCNSUserRecord,
  validateExpiry,
  validateVirtualSubdomainEnabled,
} from './utils'

export const resolveDomain = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string> => {
  const assetName = stringToHex(cnsName)

  const metadata = await cnsCardanoApi.getMetadata(
    cnsApiConfig.cnsPolicyId,
    assetName,
    fetcherConfig,
  )

  if (!metadata) throw new Resolver.Errors.NotFound()
  if (!validateExpiry(metadata)) throw new Resolver.Errors.Expired()

  const address = await cnsCardanoApi.getAssetAddress(
    cnsApiConfig.cnsPolicyId,
    assetName,
  )

  if (!address) throw new Resolver.Errors.NotFound()

  return address
}

export const resolveUserRecord = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
  fetcherConfig?: AxiosRequestConfig,
): Promise<ParsedCNSUserRecord> => {
  const assetName = stringToHex(cnsName)

  const metadata = await cnsCardanoApi.getMetadata(
    cnsApiConfig.cnsPolicyId,
    assetName,
    fetcherConfig,
  )

  if (!metadata) throw new Resolver.Errors.NotFound()
  if (!validateExpiry(metadata)) throw new Resolver.Errors.Expired()

  const inlineDatum = await cnsCardanoApi.getAssetInlineDatum(
    cnsApiConfig.recordPolicyId,
    assetName,
    [cnsApiConfig.recordAddress],
    fetcherConfig,
  )

  if (!inlineDatum || !validateCNSUserRecord(inlineDatum))
    throw new Resolver.Errors.InvalidDomain()

  const virtualSubdomains = await parseAssocMapAsync(
    inlineDatum.fields[0], // validated with validateCNSUserRecord
    async (item) => {
      const itemHex = await objToHex(item, csl)

      const bech32 = await parsePlutusAddressToBech32(
        itemHex,
        csl,
        cnsApiConfig.networkId,
      )

      return bech32
    },
  )

  const parsedInlineDatum: ParsedCNSUserRecord = {
    virtualSubdomains: validateVirtualSubdomainEnabled(metadata)
      ? virtualSubdomains
      : [],
  }

  return parsedInlineDatum
}

export const resolveVirtualSubdomain = async (
  virtualDomain: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string | undefined> => {
  const [target, cnsName, ext] = virtualDomain.split('.')

  const {virtualSubdomains} = await resolveUserRecord(
    `${cnsName}.${ext}`,
    cnsApiConfig,
    cnsCardanoApi,
    csl,
    fetcherConfig,
  )

  const resolvedVirtualDomain = virtualSubdomains?.find(
    ([key]) => key === target,
  )
  if (!resolvedVirtualDomain) throw new Resolver.Errors.NotFound()

  return resolvedVirtualDomain[1]
}

export const resolveAddress = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string> => {
  let address
  const deconstructedCns = cnsName.split('.')

  if (deconstructedCns.length === cnsApiConfig.domainLevels) {
    address = await resolveDomain(cnsName, cnsApiConfig, cnsCardanoApi)
  } else if (deconstructedCns.length === cnsApiConfig.virtualSubdomainLevels) {
    address = await resolveVirtualSubdomain(
      cnsName,
      cnsApiConfig,
      cnsCardanoApi,
      csl,
      fetcherConfig,
    )
  }

  if (!address) throw new Resolver.Errors.InvalidDomain()
  return address
}
