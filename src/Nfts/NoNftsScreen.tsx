import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View} from 'react-native'

import noNftsImage from '../assets/img/no-nft.png'
import {Spacer} from '../components'

export default function NoNftsScreen({heading}: {heading?: ReactNode}) {
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <View>{heading}</View>
      <Spacer height={75} />
      <View style={styles.imageContainer}>
        <Image source={noNftsImage} style={styles.image} />
        <Spacer height={20} />
        <Text style={styles.contentText}>{strings.noNFTs}</Text>
      </View>
    </View>
  )
}

const messages = defineMessages({
  noNFTs: {
    id: 'nft.gallery.noNFTs',
    defaultMessage: '!!!No NFTs found',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    noNFTs: intl.formatMessage(messages.noNFTs),
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },

  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    textAlign: 'center',
  },
})
