import {detectTheme} from './detect-theme'

describe('detectTheme', () => {
  it('should return "default-dark" when color scheme is "dark" and next theme is "system"', () => {
    const colorScheme = 'dark'
    const nextTheme = 'system'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-dark')
  })

  it('should return "default-light" when color scheme is not "dark" and next theme is "system"', () => {
    const colorScheme = 'light'
    const nextTheme = 'system'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-light')
  })

  it('should return the next theme when next theme is not "system"', () => {
    const colorScheme = 'dark'
    const result = detectTheme(colorScheme)
    expect(result).toBe('default-dark')
  })

  it('should return "default-dark" when next theme is "default-dark"', () => {
    const colorScheme = 'light'
    const nextTheme = 'default-dark'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-dark')
  })

  it('should return "default-light" when next theme is "default-light"', () => {
    const colorScheme = 'dark'
    const nextTheme = 'default-light'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-light')
  })

  it('should handle null colorScheme in system mode', () => {
    const colorScheme = null
    const nextTheme = 'system'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-light')
  })

  it('should handle undefined colorScheme in system mode', () => {
    const colorScheme = undefined
    const nextTheme = 'system'
    const result = detectTheme(colorScheme, nextTheme)
    expect(result).toBe('default-light')
  })
})
