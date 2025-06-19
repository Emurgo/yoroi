import React from 'react'
import {render} from '@testing-library/react-native'
import {SuspenseBoundary} from './SuspenseBoundary'
import {Text} from 'react-native'

const LazyComponent = React.lazy(() =>
  Promise.resolve({default: () => <Text>Lazy Component Loaded</Text>}),
)

describe('SuspenseBoundary Component', () => {
  it('renders fallback content while suspending', async () => {
    const {findByTestId} = render(
      <SuspenseBoundary>
        <LazyComponent />
      </SuspenseBoundary>,
    )

    const fallbackContent = await findByTestId('suspending')
    expect(fallbackContent).toBeTruthy()
  })
})
