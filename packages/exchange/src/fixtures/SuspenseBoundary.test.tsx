import * as React from 'react'
import {render} from '@testing-library/react-native'

import {Text} from 'react-native'

import {SuspenseBoundary} from './SuspenseBoundary'

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
