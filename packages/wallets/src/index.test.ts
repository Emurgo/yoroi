import * as index from './index'
describe('index test only for coverage', () => {
  it('should have CardanoApi defined', () => {
    expect(index.CardanoApi).toBeDefined()
  })

  it('should have CardanoTokenId defined', () => {
    expect(index.CardanoTokenId).toBeDefined()
  })
})
