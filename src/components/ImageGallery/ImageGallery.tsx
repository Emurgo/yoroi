import React from 'react'
import {Image, ImageSourcePropType, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Text} from '../Text'

type Props = {
  images: Array<{image: ImageSourcePropType; text: string}>
  loading: boolean
}

export const ImageGallery = ({images = [], loading = false}: Props) => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
        {images.map(({image, text}, id) => (
          <SkeletonPlaceholder key={id} enabled={loading}>
            <View style={styles.elementContainer}>
              <Image source={image} style={styles.image} />
              <Text style={styles.text}>{text}</Text>
            </View>
          </SkeletonPlaceholder>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  elementContainer: {
    padding: 5,
  },
  image: {
    marginBottom: 10, // When the skeleton is active, only margins are displayed as empty space. The Spacer component (view component) also becomes skeleton.
    height: 120,
    width: 120,
  },
  text: {
    height: 15,
    borderRadius: 50, // skeleton styling
  },
})
