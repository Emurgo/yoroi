import {describe, it, expect} from '@jest/globals'

import {createGovernanceManager} from './manager'
import {init} from '@emurgo/cross-csl-nodejs'

describe('createGovernanceManager', () => {
  const cardano = init('global')
  const options = {networkId: 1, cardano}

  it('should return a manager', () => {
    expect(createGovernanceManager(options)).toBeDefined()
  })

  describe('validateDrepKey', () => {
    const governanceManager = createGovernanceManager(options)
    const invalid = 'drep1abc'

    it('should result with invalid status for an invalid drep key string', async () => {
      expect(await governanceManager.validateDrepKey(invalid)).toMatchObject({
        status: 'invalid',
      })
    })
  })
})
