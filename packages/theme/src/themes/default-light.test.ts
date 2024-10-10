import {defaultLightTheme} from './default-light'

describe('', () => {
  it('should have base set to "light"', () => {
    expect(defaultLightTheme.base).toBe('light')
  })

  it('should have name set to "default-light"', () => {
    expect(defaultLightTheme.name).toBe('default-light')
  })
})
