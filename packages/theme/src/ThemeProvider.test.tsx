import React from 'react'
import {render, fireEvent} from '@testing-library/react-native'
import {Button, Text} from 'react-native'

import {ThemeProvider, useTheme, useThemeColor} from './ThemeProvider'
import {SupportedThemes, ThemeStorage} from './types'
import {ErrorBoundary} from '@yoroi/common'

describe('ThemeProvider', () => {
  class MockStorage implements ThemeStorage {
    key: string = 'theme-name'
    name: SupportedThemes | null
    constructor(name: SupportedThemes | undefined) {
      this.name = name ?? null
    }

    readonly save = (name: SupportedThemes) => {
      this.name = name
    }

    readonly read = () => {
      return this.name
    }
  }

  it('should render children', () => {
    const storage = new MockStorage('default-light')

    const {getByText} = render(
      <ThemeProvider storage={storage}>
        <Text>Test</Text>
      </ThemeProvider>,
    )

    expect(getByText('Test')).toBeTruthy()
  })

  it('should provide the theme context', () => {
    const storage = new MockStorage('default-light')

    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.name}</Text>
    }

    const {getByText} = render(
      <ThemeProvider storage={storage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(getByText('default-light')).toBeTruthy()
  })

  it('should provide the default theme', () => {
    const storage = new MockStorage(undefined)

    const TestComponent = () => {
      const theme = useTheme()
      return <Text>{theme.name}</Text>
    }

    const {getByText} = render(
      <ThemeProvider storage={storage}>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(getByText('system')).toBeTruthy()
  })

  it('should update the theme when selectThemeName is called', () => {
    const storage = new MockStorage('default-light')

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
      <ThemeProvider storage={storage}>
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
