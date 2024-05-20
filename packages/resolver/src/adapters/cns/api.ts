import {Api, Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {WasmModuleProxy, freeContext} from '@emurgo/cross-csl-core'
import {handleZodErrors} from '../zod-errors'
import {makeCnsCardanoApi} from './cardano-api-maker'
import {resolveAddress} from './api-helpers'

export const cnsCryptoAddress = (
  cslFactory: (scope: string) => WasmModuleProxy,
  isMainnet: boolean = true,
) => {
  return async (receiver: string, fetcherConfig?: AxiosRequestConfig) => {
    if (!receiver.includes('.')) throw new Resolver.Errors.InvalidDomain()
    if (!isCnsDomain(receiver)) throw new Resolver.Errors.UnsupportedTld()

    const cslScopeId = String(Math.random())
    const csl = cslFactory(cslScopeId)
    try {
      const cnsCardanoApi = makeCnsCardanoApi(
        isMainnet ? cnsApiConfig.mainnet.baseUrl : cnsApiConfig.preprod.baseUrl,
      )
      const address = await resolveAddress(
        receiver,
        isMainnet ? cnsApiConfig.mainnet : cnsApiConfig.preprod,
        cnsCardanoApi,
        csl,
        fetcherConfig,
      )

      return address
    } catch (error: unknown) {
      return handleCnsApiError(error)
    } finally {
      await freeContext(cslScopeId)
    }
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
    domainLevels: 2,
    virtualSubdomainLevels: 3,
  },
  preprod: {
    baseUrl: 'https://preprod-backend.yoroiwallet.com',
    cnsPolicyId: 'baefdc6c5b191be372a794cd8d40d839ec0dbdd3c28957267dc81700',
    recordPolicyId: 'a048db3b45c2aa5f1ad472338e6e6dea41a45f4350c8753a231403aa',
    recordAddress:
      'addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5',
    networkId: 0,
    domainLevels: 2,
    virtualSubdomainLevels: 3,
  },
} as const

export type CnsApiConfig = {
  baseUrl: string
  cnsPolicyId: string
  recordPolicyId: string
  recordAddress: string
  networkId: number
  domainLevels: number
  virtualSubdomainLevels: number
}

export const handleCnsApiError = (error: unknown): never => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage)
    throw new Resolver.Errors.InvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound) throw new Resolver.Errors.NotFound()

  throw error
}
