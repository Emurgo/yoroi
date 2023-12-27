import {Api, Resolver} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'
import {resolveAddress} from './cns/resolver'
import {handleZodErrors} from './zod-errors'

export const cnsCryptoAddress = async (
  receiver: string,
  fetcherConfig?: AxiosRequestConfig,
  csl?: WasmModuleProxy,
) => {
  if (!receiver.includes('.')) throw new Resolver.Errors.InvalidDomain()
  if (!isCnsDomain(receiver))
    return Promise.reject(new Resolver.Errors.UnsupportedTld())

  try {
    const address = resolveAddress(
      receiver,
      cnsApiConfig.mainnet.cnsPolicyId,
      cnsApiConfig.mainnet.recordPolicyId,
      cnsApiConfig.mainnet.recordAddress,
      cnsApiConfig.mainnet.networkId,
      cnsApiConfig.mainnet.baseUrl,
      fetcherConfig,
      csl,
    )
    return address
  } catch (error: unknown) {
    return handleCnsApiError(error)
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

export const handleCnsApiError = (error: unknown): never => {
  const zodErrorMessage = handleZodErrors(error)
  if (zodErrorMessage)
    throw new Resolver.Errors.InvalidResponse(zodErrorMessage)

  if (error instanceof Api.Errors.NotFound) throw new Resolver.Errors.NotFound()

  throw error
}
