import {themeStorageMaker} from './theme-storage-maker'
import {SupportedThemes} from '../../types'

describe('themeStorageMaker', () => {
  const mockStorage = {
    setItem: jest.fn(),
    getItem: jest.fn(),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should save the theme name to storage', () => {
    const themeStorage = themeStorageMaker({storage: mockStorage})
    const themeName: SupportedThemes = 'default-dark'

    themeStorage.save(themeName)

    expect(mockStorage.setItem).toHaveBeenCalledWith('theme-name', themeName)
  })

  it('should read the theme name from storage', () => {
    const themeStorage = themeStorageMaker({storage: mockStorage})
    const themeName: SupportedThemes = 'default-light'
    mockStorage.getItem.mockReturnValue(themeName)

    const result = themeStorage.read()

    expect(mockStorage.getItem).toHaveBeenCalledWith('theme-name')
    expect(result).toBe(themeName)
  })

  it('should return the correct key', () => {
    const themeStorage = themeStorageMaker({storage: mockStorage})

    const result = themeStorage.key

    expect(result).toBe('theme-name')
  })
})
