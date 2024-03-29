import React from 'react'
import {render, waitFor} from '@testing-library/react-native'
import {ErrorBoundary} from './ErrorBoundary'

const ProblematicChild = () => {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  test('should display an error message when a child component throws an error', async () => {
    const {getByTestId} = render(
      <ErrorBoundary>
        <ProblematicChild />
      </ErrorBoundary>,
    )

    await waitFor(() => {
      expect(getByTestId('hasError')).toBeDefined()
    })

    expect(getByTestId('hasError').props.children[0].props.children).toEqual(
      'hasError',
    )
  })
})
