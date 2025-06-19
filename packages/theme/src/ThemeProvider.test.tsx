import {App} from '@yoroi/types'

import * as React from 'react'
import {render, screen, fireEvent} from '@testing-library/react-native'
import {Button, Text, useColorScheme} from 'react-native'

import {
  ThemeProvider,
  useTheme,
  usePalette,
  useThemedAtoms,
  useBasePalette,
} from './ThemeProvider'
import {ThemeConfig} from './types'

describe('ThemeProvider and useTheme Tests', () => {
  let storedValue: ThemeConfig = 'system'
  const mockStorage: App.StorageKeyManager<ThemeConfig> = {
    key: 'theme-name',
    save: jest.fn().mockImplementation((v) => (storedValue = v)),
    read: jest.fn().mockImplementation(() => storedValue),
    remove: jest.fn(),
    subscribe: jest.fn(),
  }

  beforeEach(() => {
    storedValue = 'system'
    jest.clearAllMocks()
    // Reset useColorScheme mock to return undefined by default
    ;(useColorScheme as jest.Mock).mockReturnValue(undefined)
  })

  test('ThemeProvider renders children', () => {
    render(
      <ThemeProvider storage={mockStorage}>
        <Text>Test</Text>
      </ThemeProvider>,
    )

    expect(screen.getByText('Test')).toBeTruthy()
  })

  test('ThemeProvider provides default theme context', () => {
    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.config}</Text>
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByText('system')).toBeTruthy()
  })

  test('ThemeProvider provides theme context with custom storage', () => {
    const customStorage: App.StorageKeyManager<ThemeConfig> = {
      key: 'custom-theme',
      save: jest.fn(),
      read: jest.fn().mockReturnValue('default-dark'),
      remove: jest.fn(),
      subscribe: jest.fn(),
    }

    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.config}</Text>
    }

    render(
      <ThemeProvider storage={customStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByText('default-dark')).toBeTruthy()
  })

  test('ThemeProvider updates theme when selectTheme is called', () => {
    const TestComponent = () => {
      const theme = useTheme()
      const color = usePalette()
      return (
        <>
          <Text>{theme.config}</Text>
          <Button
            onPress={() => theme.selectTheme('default-dark')}
            title="Change Theme dark"
          />
          <Button
            onPress={() => theme.selectTheme('default-light')}
            title="Change Theme light"
          />
          <Button
            onPress={() => theme.selectTheme('system')}
            title="Change Theme auto"
          />
          <Text>{color.black_static}</Text>
        </>
      )
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    // Initial state
    expect(screen.getByText('system')).toBeTruthy()
    expect(screen.getByText('#000000')).toBeTruthy()

    // Change to light theme
    fireEvent.press(screen.getByText('Change Theme light'))
    expect(screen.getByText('default-light')).toBeTruthy()
    expect(mockStorage.save).toHaveBeenCalledWith('default-light')

    // Change to dark theme
    fireEvent.press(screen.getByText('Change Theme dark'))
    expect(screen.getByText('default-dark')).toBeTruthy()
    expect(mockStorage.save).toHaveBeenCalledWith('default-dark')

    // Change back to system theme
    fireEvent.press(screen.getByText('Change Theme auto'))
    expect(screen.getByText('system')).toBeTruthy()
    expect(mockStorage.save).toHaveBeenCalledWith('system')
  })

  test('useTheme throws error without ThemeProvider', () => {
    const TestComponent = () => {
      useTheme()
      return null
    }

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('ThemeProvider is missing')

    consoleError.mockRestore()
  })

  test('ThemeProvider falls back to dark theme when useColorScheme returns undefined', () => {
    // Mock useColorScheme to return undefined
    ;(useColorScheme as jest.Mock).mockReturnValue(undefined)

    const TestComponent = () => {
      const theme = useTheme()
      return (
        <>
          <Text>{theme.config}</Text>
          <Text>{theme.paletteName}</Text>
        </>
      )
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    // Should use system theme name but default-dark palette
    expect(screen.getByText('system')).toBeTruthy()
    expect(screen.getByText('default-dark')).toBeTruthy()
  })
})

describe('useThemedAtoms and useBasePalette Tests', () => {
  let storedValue: ThemeConfig = 'system'
  const mockStorage: App.StorageKeyManager<ThemeConfig> = {
    key: 'theme-name',
    save: jest.fn().mockImplementation((v) => (storedValue = v)),
    read: jest.fn().mockImplementation(() => storedValue),
    remove: jest.fn(),
    subscribe: jest.fn(),
  }

  beforeEach(() => {
    storedValue = 'system'
    jest.clearAllMocks()
    ;(useColorScheme as jest.Mock).mockReturnValue(undefined)
  })

  test('useThemedAtoms provides correct atom styles for dark theme', () => {
    const TestComponent = () => {
      const atoms = useThemedAtoms()
      return (
        <>
          <Text testID="bg-color-max">
            {atoms.bg_color_max.backgroundColor}
          </Text>
          <Text testID="text-primary-max">{atoms.text_primary_max.color}</Text>
          <Text testID="el-primary-max">{atoms.el_primary_max.color}</Text>
        </>
      )
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    // These values should match the dark theme colors
    expect(screen.getByTestId('bg-color-max')).toHaveTextContent('#15171F')
    expect(screen.getByTestId('text-primary-max')).toHaveTextContent('#A0B3F2')
    expect(screen.getByTestId('el-primary-max')).toHaveTextContent('#A0B3F2')
  })

  test('useThemedAtoms updates when theme changes', () => {
    const TestComponent = () => {
      const theme = useTheme()
      const atoms = useThemedAtoms()
      return (
        <>
          <Text testID="bg-color-max">
            {atoms.bg_color_max.backgroundColor}
          </Text>
          <Button
            onPress={() => theme.selectTheme('default-light')}
            title="Change to Light"
          />
        </>
      )
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    // Initial dark theme
    expect(screen.getByTestId('bg-color-max')).toHaveTextContent('#15171F')

    // Change to light theme
    fireEvent.press(screen.getByText('Change to Light'))
    expect(screen.getByTestId('bg-color-max')).toHaveTextContent('#FFFFFF')
  })

  test('useBasePalette returns correct base palette', () => {
    const TestComponent = () => {
      const basePalette = useBasePalette()
      const theme = useTheme()
      return (
        <>
          <Text testID="base-palette">{basePalette}</Text>
          <Button
            onPress={() => theme.selectTheme('default-light')}
            title="Change to Light"
          />
        </>
      )
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    // Initial dark theme
    expect(screen.getByTestId('base-palette')).toHaveTextContent('dark')

    // Change to light theme
    fireEvent.press(screen.getByText('Change to Light'))
    expect(screen.getByTestId('base-palette')).toHaveTextContent('light')
  })

  test('useThemedAtoms and useBasePalette throw error without ThemeProvider', () => {
    const TestComponent = () => {
      useThemedAtoms()
      useBasePalette()
      return null
    }

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('ThemeProvider is missing')

    consoleError.mockRestore()
  })
})
