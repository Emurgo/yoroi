import {Resolver} from '@yoroi/types'

export const getCnsCryptoAddress = async (receiver: string) => {
  if (!receiver.includes('.')) throw new Resolver.Errors.InvalidDomain()
  if (!isCnsDomain(receiver))
    return Promise.reject(new Resolver.Errors.UnsupportedTld())
  return Promise.reject(new Resolver.Errors.UnsupportedTld())
}

export const cnsSupportedTld = '.ada'
export const isCnsDomain = (value: string) => value.endsWith(cnsSupportedTld)
