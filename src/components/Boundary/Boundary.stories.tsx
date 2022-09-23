import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, StyleSheet, Text, View} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'
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
  .add('Loading/fallback', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary
          loading={{
            fallback: (
              <View>
                <Text>Loading Fallback</Text>
              </View>
            ),
          }}
        >
          <IsLoading />
        </Boundary>
      </QueryClientProvider>
    )
  })
  .add('Loading/overlay', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary>
          <LoadingWithOverlay />
        </Boundary>
      </QueryClientProvider>
    )
  })
  .add('Error/default', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary>
          <Bomb />
        </Boundary>
      </QueryClientProvider>
    )
  })
  .add('Error/fallback', () => {
    return (
      <QueryClientProvider client={new QueryClient()}>
        <Boundary
          error={{
            fallback: ({error}) => (
              <View>
                <Text>Error fallback</Text>
                <Text>{error.message}</Text>
              </View>
            ),
          }}
        >
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
    queryFn: () => Promise.reject(new Error('Error message')),
    suspense: true,
    retry: false,
  })

  return (
    <View>
      <Text>This should not be visible</Text>
    </View>
  )
}

const LoadingWithOverlay = () => {
  const {isLoading, isFetching, refetch} = useQuery({
    queryFn: () => new Promise((resolve) => setTimeout(resolve, 2000)),
  })

  return (
    <>
      <Text>this is the content</Text>
      <Text>this is the content</Text>
      <Text>this is the content</Text>

      <Button
        onPress={() => {
          console.log('refetch', Date.now())
          refetch()
        }}
        title="Refetch"
      />

      <LoadingOverlay loading={isLoading || isFetching} />
    </>
  )
}

const LoadingOverlay = ({loading}: {loading: boolean}) => {
  return loading ? (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, {opacity: 0.5, backgroundColor: 'pink'}]} />

      <View style={[StyleSheet.absoluteFill, {alignItems: 'center', justifyContent: 'center'}]}>
        <ActivityIndicator animating size="large" color="black" />
      </View>
    </View>
  ) : null
}
