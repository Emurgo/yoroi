import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {Dimensions, StyleSheet, View} from 'react-native'
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn, FullErrorFallback} from '../components'
import {NftPreview} from '../components/NftPreview/NftPreview'
import {NftRoutes, useWalletNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {NftNotFoundError, useNft} from '../yoroi-wallets'

export const NftDetailsImage = () => {
  const navigation = useWalletNavigation()
  const handleError = (error: Error) => {
    if (error instanceof NftNotFoundError) {
      navigation.navigateToNftGallery()
    }
  }
  return (
    <ErrorBoundary
      onError={handleError}
      fallbackRender={({error}) => (
        <FullErrorFallback error={error} resetErrorBoundary={() => navigation.navigateToNftGallery()} />
      )}
    >
      <ImageZoom />
    </ErrorBoundary>
  )
}

const ImageZoom = () => {
  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const wallet = useSelectedWallet()
  const nft = useNft(wallet, {id})

  const dimensions = Dimensions.get('window')
  const imageSize = Math.min(dimensions.width, dimensions.height)

  return (
    <FadeIn style={styles.container}>
      <ViewTransformer maxScale={3} minScale={1}>
        <View style={styles.contentContainer}>
          <NftPreview nft={nft} width={imageSize} height={imageSize} />
        </View>
      </ViewTransformer>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
