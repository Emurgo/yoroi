import {init} from '@emurgo/cross-csl-nodejs'
import {Api, Resolver} from '@yoroi/types'
import {ZodError, ZodIssue} from 'zod'
import {cnsCryptoAddress, handleCnsApiError} from './cns-api'
import {resolveAddress} from './cns-api-helpers'

jest.mock('./cns-api-helpers')

describe('cnsCryptoAddress', () => {
  it('should return an address for a valid receiver', async () => {
    const cls = init('ctx')
    const receiver = 'fake.ada'
    const address = 'fake-address'

    // @ts-ignore
    resolveAddress.mockReturnValue(address)

    const getAddress = cnsCryptoAddress(cls)
    await expect(getAddress(receiver)).resolves.toBe(address)
  })

  it('should throw invalid domain error', async () => {
    const cls = init('ctx')
    const receiver = 'fake-wrong-domain'

    try {
      const getAddress = cnsCryptoAddress(cls)
      await getAddress(receiver)
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.InvalidDomain)
    }
  })

  it('should throw unssupported tld error', async () => {
    const cls = init('ctx')
    const receiver = 'fake-wrong-domain.com'

    try {
      const getAddress = cnsCryptoAddress(cls)
      await getAddress(receiver)
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.UnsupportedTld)
    }
  })
})

describe('handleCnsApiError', () => {
  it('throws invalid response error', () => {
    const mockIssues: ZodIssue[] = [
      {
        // @ts-ignore
        code: 'some_error_code',
        path: ['field1'],
        message: 'Invalid field1',
      },
    ]
    const zodError = new ZodError(mockIssues)

    try {
      handleCnsApiError(zodError)
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.InvalidResponse)
    }
  })

  it('throws resolver not found error', () => {
    const notFoundError = new Api.Errors.NotFound()
    try {
      handleCnsApiError(notFoundError)
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.NotFound)
    }
  })

  it('throws unknown error', () => {
    const unknownError = new Error('unknown error')
    try {
      handleCnsApiError(unknownError)
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('unknown error')
    }
  })
})
