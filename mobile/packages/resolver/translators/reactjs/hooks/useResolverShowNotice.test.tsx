import {render, waitFor} from '@testing-library/react-native'
import * as React from 'react'
import {Text, View} from 'react-native'

import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverManagerMocks} from '../../manager.mocks'
import {useResolverShowNotice} from './useResolverShowNotice'

describe('useResolverShowNotice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockResolverManager = {...resolverManagerMocks.success}

  it('success', async () => {
    const TestResolver = () => {
      const showNotice = useResolverShowNotice()
      return (
        <View>
          <Text testID="showNotice">{JSON.stringify(showNotice.data)}</Text>
        </View>
      )
    }

    mockResolverManager.showNotice.read = jest.fn().mockResolvedValue(false)
    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })
    const {getByTestId} = render(<TestResolver />, {wrapper})

    await waitFor(() => {
      expect(getByTestId('showNotice')).toBeDefined()
    })

    const {findByText} = render(<TestResolver />, {wrapper})
    await findByText('false')
    expect(mockResolverManager.showNotice.read).toHaveBeenCalled()
  })

  it('error', async () => {
    const TestResolver = () => {
      const showNotice = useResolverShowNotice()
      return (
        <View>
          <Text testID="hasError">{JSON.stringify(showNotice)}</Text>
        </View>
      )
    }
    mockResolverManager.showNotice.read = jest.fn().mockRejectedValue('error')

    const wrapper = wrapperManagerFixture({
      resolverManager: mockResolverManager,
    })
    const {getByTestId} = render(<TestResolver />, {wrapper})

    await waitFor(() => {
      const json = JSON.parse(getByTestId('hasError').props.children as string)
      expect(json.isError).toBe(true)
    })
  })
})
