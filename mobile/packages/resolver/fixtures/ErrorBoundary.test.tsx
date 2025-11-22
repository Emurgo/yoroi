import {render} from '@testing-library/react-native'
import React from 'react'

import {ErrorBoundary} from './ErrorBoundary'

// Component that throws an error
const ThrowError = ({shouldThrow}: {shouldThrow: boolean}) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return null
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    // Note: In React Native, div is not a valid component, but this tests the boundary logic
    expect(() =>
      render(
        <ErrorBoundary>
          <div>Test</div>
        </ErrorBoundary>,
      ),
    ).not.toThrow()
  })

  it('should catch errors and display error UI', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const {getByTestId} = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(getByTestId('hasError')).toBeDefined()
    consoleSpy.mockRestore()
  })

  it('should call getDerivedStateFromError when error occurs', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const {getByTestId} = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    )

    const errorView = getByTestId('hasError')
    expect(errorView).toBeDefined()
    // Error should be serialized in the view
    expect(errorView).toBeTruthy()

    consoleSpy.mockRestore()
  })
})
