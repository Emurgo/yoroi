import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {Button, StyleSheet, Text, View} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'
import {useQuery} from 'react-query'

import {QueryProvider} from '../../../storybook/decorators'
import {errorMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'
import {Boundary} from './Boundary'

storiesOf('Boundary', module)
  .add('Loading default', () => {
    return (
      <QueryProvider>
        <Boundary>
          <IsLoading />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Loading/fallback', () => {
    return (
      <QueryProvider>
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
      </QueryProvider>
    )
  })
  .add('Loading/debug', () => {
    return (
      <QueryProvider>
        <Boundary debug>
          <IsLoading />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Loading/overlay', () => {
    return (
      <QueryProvider>
        <Boundary>
          <LoadingWithOverlay />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Error/default large size', () => {
    return (
      <QueryProvider>
        <Boundary>
          <Bomb />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Error/default small size', () => {
    return (
      <QueryProvider>
        <Boundary error={{size: 'small'}}>
          <Bomb />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Error/default inline size', () => {
    return (
      <QueryProvider>
        <Boundary error={{size: 'inline'}}>
          <Bomb />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Error/default i18n error', () => {
    return (
      <QueryProvider>
        <Boundary>
          <I18nMessageBomb />
        </Boundary>
      </QueryProvider>
    )
  })
  .add('Error/fallback', () => {
    return (
      <QueryProvider>
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
      </QueryProvider>
    )
  })
  .add('Error/debug', () => {
    return (
      <QueryProvider>
        <Boundary debug>
          <Bomb />
        </Boundary>
      </QueryProvider>
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
    queryKey: ['error'],
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

export class i18Error extends LocalizableError {
  constructor() {
    super({
      id: errorMessages.fetchError.message.id,
      defaultMessage: errorMessages.fetchError.message.defaultMessage,
    })
  }
}

const I18nMessageBomb = () => {
  useQuery({
    queryKey: ['i18nMessageError'],
    queryFn: () => Promise.reject(new i18Error()),
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
