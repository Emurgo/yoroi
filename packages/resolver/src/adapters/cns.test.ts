import {Resolver} from '@yoroi/types'

import {getCnsCryptoAddress} from './cns' // Adjust the path accordingly

describe('getCnsCryptoAddress', () => {
  it.each`
    domain         | error
    ${'test'}      | ${Resolver.Errors.InvalidDomain}
    ${'test.tada'} | ${Resolver.Errors.UnsupportedTld}
    ${'test.ada'}  | ${Resolver.Errors.UnsupportedTld}
  `('should reject with error $error', async ({domain, error}) => {
    await expect(getCnsCryptoAddress(domain)).rejects.toThrowError(error)
  })
})
