import {Api, Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {handleZodErrors} from './zod-errors'
import {CnsCardanoApi, makeCnsCardanoApi} from './cns-cardano-api-maker'
import {ParsedCNSUserRecord} from './cns-types'
import {
  hexToString,
  objToHex,
  parseAssocMap,
  parseAssocMapAsync,
  parsePlutusAddressToBech32,
  stringToHex,
  validateCNSUserRecord,
  validateExpiry,
  validateVirtualSubdomainEnabled,
} from './cns-utils'

export const cnsCryptoAddress = (csl: WasmModuleProxy) => {
  return async (receiver: string, fetcherConfig?: AxiosRequestConfig) => {
    if (!receiver.includes('.')) throw new Resolver.Errors.InvalidDomain()
    if (!isCnsDomain(receiver))
      return Promise.reject(new Resolver.Errors.UnsupportedTld())

    const cnsCardanoApi = makeCnsCardanoApi(
      cnsApiConfig.mainnet.baseUrl,
      fetcherConfig,
    )

    try {
      const address = resolveAddress(
        receiver,
        cnsApiConfig.mainnet,
        cnsCardanoApi,
        csl,
      )
      return address
    } catch (error: unknown) {
      return handleCnsApiError(error)
    }
  }
}

export const resolveDomain = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
): Promise<string | null> => {
  try {
    const assetName = stringToHex(cnsName)
    const assetHex = `${cnsApiConfig.cnsPolicyId}${assetName}`

    const metadata = await cnsCardanoApi.getMetadata(
      cnsApiConfig.cnsPolicyId,
      assetName,
    )

    if (!metadata) return null
    if (!validateExpiry(metadata)) throw new Resolver.Errors.Expired()

    const address = await cnsCardanoApi.getAssetAddress(assetHex)
    if (!address) return null

    return address
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

const resolveUserRecord = async (
  cnsName: string,
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
): Promise<ParsedCNSUserRecord | string> => {
  try {
    const assetName = stringToHex(cnsName)

    const metadata = await cnsCardanoApi.getMetadata(
      cnsApiConfig.cnsPolicyId,
      assetName,
    )
    if (!metadata) throw new Resolver.Errors.NotFound()
    if (!validateExpiry(metadata)) throw new Resolver.Errors.Expired()

    const recordAssetHex = `${cnsApiConfig.recordPolicyId}${assetName}`
    const inlineDatum = await cnsCardanoApi.getAssetInlineDatum(
      recordAssetHex,
      [cnsApiConfig.recordAddress],
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
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
): Promise<string[][] | string> => {
  try {
    const parsedUserRecord = await resolveUserRecord(
      cnsName,
      cnsApiConfig,
      cnsCardanoApi,
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
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
): Promise<string | undefined> => {
  try {
    const [target, cnsName, ext] = virtualDomain.split('.')

    const virtualDomains = await resolveVirtualSubdomains(
      `${cnsName}.${ext}`,
      cnsApiConfig,
      cnsCardanoApi,
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
  cnsApiConfig: CnsApiConfig,
  cnsCardanoApi: CnsCardanoApi,
  csl: WasmModuleProxy,
): Promise<string | null> => {
  try {
    let address
    const deconstructedCns = cnsName.split('.')

    if (deconstructedCns.length === 2) {
      address = await resolveDomain(cnsName, cnsApiConfig, cnsCardanoApi)
    }

    if (deconstructedCns.length === 3) {
      address = await resolveVirtualSubdomain(
        cnsName,
        cnsApiConfig,
        cnsCardanoApi,
        csl,
      )
    }

    if (!address) throw new Resolver.Errors.InvalidDomain()
    return address
  } catch (error: unknown) {
    return Promise.reject(error)
  }
}

export const cnsSupportedTld = '.ada'
export const isCnsDomain = (value: string) => value.endsWith(cnsSupportedTld)

export const cnsApiConfig = {
  mainnet: {
    baseUrl: 'https://api.yoroiwallet.com',
    cnsPolicyId: 'e0c4c2d7c4a0ed2cf786753fd845dee82c45512cee03e92adfd3fb8d',
    recordPolicyId: 'a1db6026bc00963c1a70af10cdd98f2304be5da44ae4af8f770dcfd3',
    recordAddress:
      'addr1z8dyldfnnpg4w85d32lv64f5ldra02juhnzxdvlyyrpfs0leh7ahm4pdpqxx0mc0wvmu6n025jml40g7pfd0j0vf6aqsl2tlcx',
    networkId: 1,
  },
} as const

export type CnsApiConfig = {
  baseUrl: string
  cnsPolicyId: string
  recordPolicyId: string
  recordAddress: string
  networkId: number
}

export const handleCnsApiError = (error: unknown): never => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage)
    throw new Resolver.Errors.InvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound) throw new Resolver.Errors.NotFound()

  throw error
}
