import {Resolver} from '@yoroi/types'

export const getCnsCryptoAddress = async (_receiverDomain: string) => {
  if (!_receiverDomain.includes('.')) throw new Resolver.Errors.InvalidDomain()
  if (!isCnsDomain(_receiverDomain))
    return Promise.reject(new Resolver.Errors.UnsupportedTld())
  return Promise.reject(new Resolver.Errors.UnsupportedTld())
}

export const cnsSupportedTld = '.ada'
export const isCnsDomain = (value: string) => value.endsWith(cnsSupportedTld)
