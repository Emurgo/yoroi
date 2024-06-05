import {useFocusEffect} from '@react-navigation/native'
import {Image as ExpoImage} from 'expo-image'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Spacer} from '../../components'
import placeholder from './placeholder_image.png'

export const Playground = () => {
  const [loading, setLoading] = React.useState<boolean>(false)

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true)
      ExpoImage.clearDiskCache()
      ExpoImage.clearMemoryCache()
      setTimeout(() => setLoading(false), 5000)
    }, []),
  )

  return (
    <View style={styles.root}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.container}>
          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <ExpoImage
              source="http://192.168.0.13:4567/3000/https://picsum.photos/300/300"
              style={{height: 150, width: 150, padding: 5}}
              placeholder={placeholder}
              onProgress={() => {
                console.log('onProgress: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoadStart={() => {
                console.log('onLoadStart: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoad={() => {
                console.log('onLoad: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
            />
          </SkeletonPlaceholder>

          <Spacer height={10} />

          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <View style={{height: 24}}>
              <Text style={{paddingVertical: 10, width: 150}}>Image 1</Text>
            </View>
          </SkeletonPlaceholder>
        </View>

        <Spacer width={16} />

        <View style={styles.container}>
          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <ExpoImage
              source="http://192.168.0.13:4567/1000/https://picsum.photos/150/150"
              style={{height: 150, width: 150, padding: 5}}
              placeholder={placeholder}
              onProgress={() => {
                console.log('onProgress: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoadStart={() => {
                console.log('onLoadStart: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoad={() => {
                console.log('onLoad: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
            />
          </SkeletonPlaceholder>

          <Spacer height={10} />

          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <View style={{height: 30}}>
              <Text style={{paddingVertical: 10, width: 150}}>Image 2</Text>
            </View>
          </SkeletonPlaceholder>
        </View>
      </View>

      <Spacer height={16} />

      <View style={{flexDirection: 'row'}}>
        <View style={styles.container}>
          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <ExpoImage
              source="http://192.168.0.13:4567/5000/https://picsum.photos/200/200"
              style={{height: 150, width: 150, padding: 5}}
              placeholder={placeholder}
              onProgress={() => {
                console.log('onProgress: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoadStart={() => {
                console.log('onLoadStart: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoad={() => {
                console.log('onLoad: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
            />
          </SkeletonPlaceholder>

          <Spacer height={10} />

          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <View style={{height: 24}}>
              <Text style={{paddingVertical: 10, width: 150}}>Image 3</Text>
            </View>
          </SkeletonPlaceholder>
        </View>

        <View style={styles.container}>
          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <ExpoImage
              source="http://192.168.0.13:4567/1000/https://picsum.photos/180/180"
              style={{height: 150, width: 150, padding: 5}}
              placeholder={placeholder}
              onProgress={() => {
                console.log('onProgress: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoadStart={() => {
                console.log('onLoadStart: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
              onLoad={() => {
                console.log('onLoad: ' + 1 + ' ' + new Date().getMilliseconds())
              }}
            />
          </SkeletonPlaceholder>

          <Spacer height={10} />

          <SkeletonPlaceholder enabled={loading} borderRadius={8}>
            <View style={{height: 24}}>
              <Text style={{paddingVertical: 10, width: 150}}>Image 4</Text>
            </View>
          </SkeletonPlaceholder>
        </View>
      </View>
    </View>
  )
}

// const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
  },
})
