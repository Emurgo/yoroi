import * as React from 'react'
import {render, screen, fireEvent} from '@testing-library/react-native'
import {ErrorBoundary} from '@yoroi/common'
import {Button, Text} from 'react-native'
import * as ReactNative from 'react-native'
import {App} from '@yoroi/types'

import {ThemeProvider, useTheme, usePalette} from './ThemeProvider'
import {ThemeName} from './types'

describe('ThemeProvider and useTheme Tests', () => {
  let storedValue: ThemeName | undefined
  const mockStorage: App.StorageKeyManager<ThemeName> = {
    key: 'theme-name',
    save: jest.fn().mockImplementation((v) => (storedValue = v)),
    read: jest.fn().mockImplementation(() => storedValue),
    remove: jest.fn(),
    subscribe: jest.fn(),
  }

  beforeEach(() => {
    storedValue = undefined
    jest.clearAllMocks()
    // Reset useColorScheme mock to return undefined by default
    ;(ReactNative.useColorScheme as jest.Mock).mockReturnValue(undefined)
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
      return <Text>{theme.name}</Text>
    }

    render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByText('system')).toBeTruthy()
  })

  test('ThemeProvider provides theme context with custom storage', () => {
    const customStorage: App.StorageKeyManager<ThemeName> = {
      key: 'custom-theme',
      save: jest.fn(),
      read: jest.fn().mockReturnValue('default-dark'),
      remove: jest.fn(),
      subscribe: jest.fn(),
    }

    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.name}</Text>
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
          <Text>{theme.name}</Text>
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
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>,
      )
    }).toThrow()

    consoleError.mockRestore()
  })

  test('ThemeProvider falls back to dark theme when useColorScheme returns undefined', () => {
    // Mock useColorScheme to return undefined
    ;(ReactNative.useColorScheme as jest.Mock).mockReturnValue(undefined)

    const TestComponent = () => {
      const theme = useTheme()
      return (
        <>
          <Text>{theme.name}</Text>
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
