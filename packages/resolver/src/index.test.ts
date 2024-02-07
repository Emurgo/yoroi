import {mocksResolver} from './index'

describe('mocksResolver', () => {
  it('should have the correct structure', () => {
    expect(mocksResolver).toHaveProperty('storage')
    expect(mocksResolver).toHaveProperty('api')
    expect(mocksResolver).toHaveProperty('manager')
  })
})
