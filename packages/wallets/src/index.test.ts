import * as index from './index'
describe('index test only for coverage', () => {
  it('should have Cardano object defined', () => {
    expect(index.Cardano).toBeDefined()
  })

  it('should have asFingerprint function defined', () => {
    expect(index.Cardano.asFingerprint).toBeDefined()
  })
})
