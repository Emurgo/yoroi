import React from 'react'
import {
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Text} from '../Text'

type Props = {
  images: Array<{
    image: ImageSourcePropType
    text: string
    onPress?: ((event: GestureResponderEvent) => void) | undefined
  }>
  loading: boolean
}

export const ImageGallery = ({images = [], loading = false}: Props) => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
        {images.map(({image, text, onPress}, id) => (
          <SkeletonPlaceholder key={id} enabled={loading}>
            <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
              <View>
                <Image source={image} style={styles.image} />
                <Text style={styles.textTop}>{text}</Text>
              </View>
            </TouchableOpacity>
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
  imageContainer: {
    paddingHorizontal: 5,
  },
  image: {
    marginBottom: 8,
    height: 175,
    width: 175,
    borderRadius: 8,
  },
  textTop: {
    marginBottom: 13,
    height: 16,
    width: 148,
    borderRadius: 50, // skeleton styling
  },
})
