// @flow
import jestSetup from '../../jestSetup'
import {checkDeviceVersion, DeprecatedAdaAppError} from './ledgerUtils'

import type {GetVersionResponse} from '@cardano-foundation/ledgerjs-hw-app-cardano'

jestSetup.setup()

describe('encryption/decryption', () => {
  it('should throw on outdated ledger Ada app', () => {
    expect.assertions(1)
    const mockResponse: GetVersionResponse = {
      major: 2,
      minor: 0,
      patch: 4,
      flags: {isDebug: false},
    }
    expect(() => checkDeviceVersion(mockResponse)).toThrow(
      DeprecatedAdaAppError,
    )
  })
})
