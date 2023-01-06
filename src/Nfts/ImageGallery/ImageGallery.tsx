import React, {useEffect} from 'react'
import {
  Dimensions,
  GestureResponderEvent,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  VirtualizedList,
} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer, Text} from '../../components'
import {useNftModerationStatus} from '../../hooks'
import {getAssetFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNFT} from '../../yoroi-wallets/types'
import placeholderImage from './placeholder.png'

type Props = {
  nfts: YoroiNFT[]
  onSelect: (index: number) => void
}

const IMAGE_PADDING = 8
const TEXT_PADDING = 13

export const SkeletonGallery = ({amount}: {amount: number} = {amount: 3}) => {
  const placeholders = new Array(amount).fill(undefined)
  return (
    <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
      {placeholders.map((item, index) => (
        <SkeletonImagePlaceholder key={index} />
      ))}
    </ScrollView>
  )
}

export const ImageGallery = ({nfts = [], onSelect}: Props) => {
  const rows = groupArray(nfts)
  return (
    <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
      <VirtualizedList
        data={rows}
        initialNumToRender={4}
        getItem={(array, index) => array[index]}
        getItemCount={() => rows.length}
        keyExtractor={(row: Array<YoroiNFT | undefined>, index) =>
          row[0] !== undefined
            ? getAssetFingerprint(row[0].metadata.policyId, row[0].metadata.assetNameHex)
            : String(index)
        }
        renderItem={({item: [nft1, nft2]}) => {
          const nft1Fingerprint = nft1 ? getAssetFingerprint(nft1.metadata.policyId, nft1.metadata.assetNameHex) : null
          const nft2Fingerprint = nft2 ? getAssetFingerprint(nft2.metadata.policyId, nft2.metadata.assetNameHex) : null
          return (
            <View style={styles.row}>
              {nft1 && nft1Fingerprint && (
                <ModeratedImage
                  onPress={() => onSelect(nfts.indexOf(nft1))}
                  image={nft1.image}
                  fingerprint={nft1Fingerprint}
                  text={nft1.name}
                  key={nft1Fingerprint}
                />
              )}
              {nft2 && nft2Fingerprint && (
                <ModeratedImage
                  onPress={() => onSelect(nfts.indexOf(nft2))}
                  image={nft2.image}
                  fingerprint={nft2Fingerprint}
                  text={nft2.name}
                  key={nft2Fingerprint}
                />
              )}
            </View>
          )
        }}
      />
    </ScrollView>
  )
}

interface ModeratedImageProps {
  image: string
  text: string
  onPress?(event: GestureResponderEvent): void
  fingerprint: string
}

const ModeratedImage = ({fingerprint, image, text, onPress}: ModeratedImageProps) => {
  const wallet = useSelectedWallet()
  const moderationStatusQuery = useNftModerationStatus({wallet, fingerprint})

  useEffect(() => {
    if (moderationStatusQuery.data === 'pending') {
      moderationStatusQuery.refetch()
    }
  }, [moderationStatusQuery.data, moderationStatusQuery])
  const size = getImageSize()

  const isPendingReview = moderationStatusQuery.data === 'pending' || moderationStatusQuery.data === 'manual_review'
  const showSkeleton = moderationStatusQuery.isLoading || isPendingReview

  const isGreenImage = moderationStatusQuery.data === 'green'
  const isYellowImage = moderationStatusQuery.data === 'yellow'
  const isRedImage = moderationStatusQuery.data === 'red'

  if (showSkeleton) {
    return <SkeletonImagePlaceholder />
  }

  return (
    <TouchableOpacity disabled={isRedImage} onPress={onPress} style={[styles.imageContainer]}>
      {isGreenImage ? (
        <>
          <Image source={{uri: image}} style={[styles.image, {width: size, height: size}]} />
          <Spacer height={IMAGE_PADDING} />
          <Text style={[styles.textTop, {width: size}]}>{text}</Text>
          <Spacer height={TEXT_PADDING} />
        </>
      ) : isYellowImage ? (
        <View>
          <View style={styles.imageWrapper}>
            <Image source={{uri: image}} style={[styles.image, {width: size, height: size}]} blurRadius={20} />
            <View style={styles.eyeWrapper}>
              <Icon.EyeOff size={20} color="#FFFFFF" />
            </View>
          </View>
          <Spacer height={IMAGE_PADDING} />
          <Text style={[styles.textTop, {width: size}]}>{text}</Text>
          <Spacer height={TEXT_PADDING} />
        </View>
      ) : isRedImage ? (
        <>
          <Image source={placeholderImage} style={[styles.image, {width: size, height: size}]} />
          <Spacer height={IMAGE_PADDING} />
          <Text style={[styles.textTop, {width: size}]}>{text}</Text>
          <Spacer height={TEXT_PADDING} />
        </>
      ) : null}
    </TouchableOpacity>
  )
}

function SkeletonImagePlaceholder() {
  const size = getImageSize()
  const textSize = 20
  return (
    <View style={[styles.imageContainer, {width: size + 10, height: size + IMAGE_PADDING + textSize + TEXT_PADDING}]}>
      <SkeletonPlaceholder enabled={true}>
        <View>
          <View style={{width: size, height: size, borderRadius: 8}} />
          <View
            style={{
              marginTop: TEXT_PADDING,
              width: (size * 3) / 4,
              height: textSize,
              borderRadius: 8,
            }}
          />
        </View>
      </SkeletonPlaceholder>
    </View>
  )
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
  },
  eyeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    paddingHorizontal: 5,
  },
  image: {
    height: 164,
    width: 164,
    borderRadius: 8,
  },
  textTop: {
    fontSize: 14,
    lineHeight: 22,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
})

function getImageSize() {
  const dimensions = Dimensions.get('window')
  const minSize = Math.min(dimensions.width, dimensions.height)
  return minSize / 2 - 26
}

function groupArray<T>(arr: T[]) {
  const result: Array<(T | undefined)[]> = []
  for (let i = 0; i < arr.length; i += 2) {
    result.push([arr[i], arr[i + 1]])
  }
  return result
}
