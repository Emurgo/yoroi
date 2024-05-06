import {defaultDarkTheme} from './default-dark'

describe('defaultDarkTheme', () => {
  it('should have base set to "dark"', () => {
    expect(defaultDarkTheme.base).toBe('dark')
  })

  it('should have name set to "default-dark"', () => {
    expect(defaultDarkTheme.name).toBe('default-dark')
  })
})
