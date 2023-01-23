import type {GetVersionResponse} from '@cardano-foundation/ledgerjs-hw-app-cardano'

import {checkDeviceVersion, DeprecatedAdaAppError} from './ledgerUtils'

describe('encryption/decryption', () => {
  it('should throw on outdated ledger Ada app', () => {
    expect.assertions(1)
    const version = {
      major: 2,
      minor: 0,
      patch: 4,
      flags: {isDebug: false},
    }
    const mockResponse: GetVersionResponse = {
      version,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      compatibility: {} as any,
    }
    expect(() => checkDeviceVersion(mockResponse)).toThrow(DeprecatedAdaAppError)
  })
})
