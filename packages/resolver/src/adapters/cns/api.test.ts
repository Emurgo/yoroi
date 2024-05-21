import {init} from '@emurgo/cross-csl-nodejs'
import {Api, Resolver} from '@yoroi/types'
import {ZodError, ZodIssue} from 'zod'
import {cnsCryptoAddress, handleCnsApiError} from './api'
import {resolveAddress} from './api-helpers'

jest.mock('./api-helpers')

describe('cnsCryptoAddress', () => {
  beforeEach(jest.clearAllMocks)

  it('should return an address for a valid receiver in mainnet', async () => {
    const cls = init
    const receiver = 'fake.ada'
    const address = 'fake-address'
    const isMainnet = true

    // @ts-ignore
    resolveAddress.mockReturnValue(address)

    const getAddress = cnsCryptoAddress(cls, isMainnet)
    await expect(getAddress(receiver)).resolves.toBe(address)
  })

  it('should return an address for a valid receiver  in preprod', async () => {
    const cls = init
    const receiver = 'fake.ada'
    const address = 'fake-address'
    const isMainnet = false

    // @ts-ignore
    resolveAddress.mockReturnValue(address)

    const getAddress = cnsCryptoAddress(cls, isMainnet)
    await expect(getAddress(receiver)).resolves.toBe(address)
  })

  it('should throw invalid domain error', async () => {
    const cls = init
    const receiver = 'fake-wrong-domain'

    try {
      const getAddress = cnsCryptoAddress(cls)
      await getAddress(receiver)

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.InvalidDomain)
    }
  })

  it('should throw unssupported tld error', async () => {
    const cls = init
    const receiver = 'fake-wrong-domain.com'

    try {
      const getAddress = cnsCryptoAddress(cls)
      await getAddress(receiver)

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.UnsupportedTld)
    }
  })

  it('should catch a resolveAddress error', async () => {
    const cls = init
    const receiver = 'domain.ada'
    const error = new Error('random')
    // @ts-ignore
    resolveAddress.mockImplementation(() => {
      throw error
    })

    try {
      const getAddress = cnsCryptoAddress(cls)
      await getAddress(receiver)

      fail('it should crash before')
    } catch (e: any) {
      expect(e.message).toBe(error.message)
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

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.InvalidResponse)
    }
  })

  it('throws resolver not found error', () => {
    const notFoundError = new Api.Errors.NotFound()
    try {
      handleCnsApiError(notFoundError)

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Resolver.Errors.NotFound)
    }
  })

  it('throws unknown error', () => {
    const unknownError = new Error('unknown error')
    try {
      handleCnsApiError(unknownError)

      fail('it should crash before')
    } catch (e: any) {
      expect(e).toBeInstanceOf(Error)
      expect(e.message).toBe('unknown error')
    }
  })
})
