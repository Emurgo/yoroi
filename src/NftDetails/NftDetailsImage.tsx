/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect} from 'react'
// import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'

import {FadeIn, OfflineBanner, StatusBar} from '../components'
// import globalMessages from '../i18n/global-messages'
// import {useSelectedWallet} from '../SelectedWallet'
import {mockNFTs} from '../Nfts/Nfts'

type Params = {id: string}

export const NftDetailsImage = () => {
  const {id} = useRoute().params as Params
  const nft = mockNFTs[id] ?? {}
  useTitle('')

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />

      <View style={styles.imageContainer}>
        <Image source={nft.image} style={styles.image} />
      </View>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '12.5%',
  },
  image: {
    maxWidth: '100%',
  },
})

const useTitle = (text: string) => {
  const navigation = useNavigation()
  useEffect(() => navigation.setOptions({title: text}))
}
