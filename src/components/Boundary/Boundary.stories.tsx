/* eslint-disable @typescript-eslint/no-explicit-any */
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Text, View} from 'react-native'
import {QueryClient, QueryClientProvider, useQuery} from 'react-query'

import {Boundary} from './Boundary'

storiesOf('Boundary', module)
  .add('Loading default', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary>
          <IsLoading />
        </Boundary>
      </QueryClientProvider>
    )
  })
  .add('Error default', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary>
          <Bomb />
        </Boundary>
      </QueryClientProvider>
    )
  })

const IsLoading = () => {
  useQuery({
    queryKey: ['loading'],
    queryFn: () => new Promise(() => undefined),
    suspense: true,
    retry: false,
  })

  return (
    <View>
      <Text>This should not be visible</Text>
    </View>
  )
}

const Bomb = () => {
  useQuery({
    queryKey: ['loading'],
    queryFn: () => Promise.reject("I'm a bomb"),
    suspense: true,
    retry: false,
  })

  return (
    <View>
      <Text>This should not be visible</Text>
    </View>
  )
}
