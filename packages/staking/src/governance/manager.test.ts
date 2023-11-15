import {describe, it, expect} from '@jest/globals'

import {createGovernanceManager} from './manager'

describe('createGovernanceManager', () => {
  it('should return a manager', () => {
    expect(createGovernanceManager({networkId: 1})).toBeDefined()
  })
})
