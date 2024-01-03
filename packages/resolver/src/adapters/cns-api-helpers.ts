import {Resolver} from '@yoroi/types'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {CnsApiConfig} from './cns-api'
import {CnsCardanoApi} from './cns-cardano-api-maker'
import {ParsedCNSUserRecord} from './cns-types'
import {
  objToHex,
  parseAssocMapAsync,
  parsePlutusAddressToBech32,
  stringToHex,
  validateCNSUserRecord,
  validateExpiry,
  validateVirtualSubdomainEnabled,
} from './cns-utils'
import {AxiosRequestConfig} from 'axios'

export const resolveDomain = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  fetcherConfig?: AxiosRequestConfig,
): Promise<string> => {
  const assetName = stringToHex(cnsName)
  const assetHex = `${cnsApiConfig.cnsPolicyId}${assetName}`

  const metadata = await cnsCardanoApi.getMetadata(
    cnsApiConfig.cnsPolicyId,
    assetName,
    fetcherConfig,
  )

  if (!metadata) throw new Resolver.Errors.NotFound()
  if (!validateExpiry(metadata)) throw new Resolver.Errors.Expired()

  const address = await cnsCardanoApi.getAssetAddress(assetHex)
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

  const recordAssetHex = `${cnsApiConfig.recordPolicyId}${assetName}`
  const inlineDatum = await cnsCardanoApi.getAssetInlineDatum(
    recordAssetHex,
    [cnsApiConfig.recordAddress],
    fetcherConfig,
  )

  if (!inlineDatum) throw new Resolver.Errors.NotFound()
  if (!validateCNSUserRecord(inlineDatum))
    throw new Resolver.Errors.InvalidResponse()

  const virtualSubdomains = await parseAssocMapAsync(
    inlineDatum.fields[0],
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

  if (deconstructedCns.length === 2) {
    address = await resolveDomain(cnsName, cnsApiConfig, cnsCardanoApi)
  } else if (deconstructedCns.length === 3) {
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
