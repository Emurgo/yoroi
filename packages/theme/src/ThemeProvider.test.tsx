import * as React from 'react'
import {render, screen, fireEvent} from '@testing-library/react-native'
import {ErrorBoundary} from '@yoroi/common'
import {Button, Text} from 'react-native'

import {ThemeProvider, useTheme, useThemeColor} from './ThemeProvider'
import {SupportedThemes, ThemeStorage} from './types'

describe('ThemeProvider and useTheme Tests', () => {
  let storedValue: SupportedThemes | undefined
  const mockStorage: ThemeStorage = {
    key: 'theme-name',
    save: jest.fn().mockImplementation((v) => (storedValue = v)),
    read: jest.fn().mockImplementation(() => storedValue),
  }

  beforeEach(() => {
    storedValue = undefined
    jest.clearAllMocks()
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
    const customStorage: ThemeStorage = {
      key: 'custom-theme',
      save: jest.fn(),
      read: jest.fn().mockReturnValue('default-dark'),
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

  test('ThemeProvider updates theme when selectThemeName is called', () => {
    const TestComponent = () => {
      const theme = useTheme()
      const color = useThemeColor()
      return (
        <>
          <Text>{theme.name}</Text>
          <Button
            onPress={() => theme.selectThemeName('default-dark')}
            title="Change Theme dark"
          />
          <Button
            onPress={() => theme.selectThemeName('default-light')}
            title="Change Theme light"
          />
          <Button
            onPress={() => theme.selectThemeName('system')}
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
})
