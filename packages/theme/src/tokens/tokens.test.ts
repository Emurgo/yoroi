import {tokens} from './tokens'

describe('tokens', () => {
  it('should have defined values for all properties', () => {
    expect(tokens).toBeDefined()
    expect(tokens.space).toBeDefined()
    expect(tokens.borderRadius).toBeDefined()
    expect(tokens.fontSize).toBeDefined()
    expect(tokens.lineHeight).toBeDefined()
    expect(tokens.fontWeight).toBeDefined()
  })
})
