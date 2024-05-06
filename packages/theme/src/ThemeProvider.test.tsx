import React from 'react'
import {render, fireEvent} from '@testing-library/react-native'
import {Button, Text} from 'react-native'

import {ThemeProvider, useTheme, useThemeColor} from './ThemeProvider'
import {ThemeStorage} from './types'
import {ErrorBoundary} from '@yoroi/common'

describe('ThemeProvider', () => {
  const mockStorage: ThemeStorage = {
    key: 'theme-name',
    save: jest.fn(),
    read: jest.fn(),
  }

  it('should render children', () => {
    const {getByText} = render(
      <ThemeProvider storage={mockStorage}>
        <Text>Test</Text>
      </ThemeProvider>,
    )

    expect(getByText('Test')).toBeTruthy()
  })

  it('should provide the theme context', () => {
    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.name}</Text>
    }

    const {getByText} = render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(getByText('default-light')).toBeTruthy()
  })

  it('should update the theme when selectThemeName is called', () => {
    const TestComponent = () => {
      const theme = useTheme()
      const color = useThemeColor()
      return (
        <>
          <Text>{theme.name}</Text>
          <Button
            onPress={() => theme.selectThemeName('default-dark')}
            title="Change Theme"
          />
          <Text>{color.black_static}</Text>
        </>
      )
    }

    const {getByText} = render(
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(getByText('default-light')).toBeTruthy()

    expect(getByText('#000000')).toBeTruthy()

    fireEvent.press(getByText('Change Theme'))

    expect(getByText('default-dark')).toBeTruthy()
  })

  it('should throw an error when useTheme is called without a provider', () => {
    const TestComponent = () => {
      useTheme()
      return null
    }

    const {getByTestId} = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>,
    )

    expect(getByTestId('hasError')).toBeTruthy()
  })
})
