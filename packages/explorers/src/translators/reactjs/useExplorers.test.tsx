import * as React from 'react'
import {Text, View} from 'react-native'
import {render, waitFor} from '@testing-library/react-native'
import {Chain} from '@yoroi/types'

import {useExplorers} from './useExplorers'

describe('useExplorers', () => {
  it('success', async () => {
    const TestComponent = () => {
      const explorers = useExplorers(Chain.Network.Mainnet)
      return (
        <View>
          <Text testID="data">{JSON.stringify(explorers)}</Text>
        </View>
      )
    }

    const {getByTestId} = render(<TestComponent />)

    await waitFor(() => {
      expect(getByTestId('data')).toBeDefined()
    })
  })
})
