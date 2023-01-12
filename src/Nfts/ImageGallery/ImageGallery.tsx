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

  const isPendingReview = moderationStatusQuery.data === 'pending' || moderationStatusQuery.data === 'manual_review'
  const showSkeleton = moderationStatusQuery.isLoading || isPendingReview

  const isImageApproved = moderationStatusQuery.data === 'approved'
  const isImageWithConsent = moderationStatusQuery.data === 'consent'
  const isImageBlocked = moderationStatusQuery.data === 'blocked'

  if (showSkeleton) {
    return <SkeletonImagePlaceholder />
  }

  return (
    <TouchableOpacity disabled={isImageBlocked} onPress={onPress} style={[styles.imageContainer]}>
      {isImageApproved ? (
        <ApprovedNFT text={text} uri={image} />
      ) : isImageWithConsent ? (
        <RequiresConsentNFT text={text} uri={image} />
      ) : isImageBlocked ? (
        <BlockedNFT text={text} />
      ) : null}
    </TouchableOpacity>
  )
}

function BlockedNFT({text}: {text: string}) {
  return (
    <>
      <Image source={placeholderImage} style={[styles.image, {width: imageSize, height: imageSize}]} />
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: imageSize}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </>
  )
}

function RequiresConsentNFT({uri, text}: {text: string; uri: string}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <Image source={{uri}} style={[styles.image, {width: imageSize, height: imageSize}]} blurRadius={20} />
        <View style={styles.eyeWrapper}>
          <Icon.EyeOff size={20} color="#FFFFFF" />
        </View>
      </View>
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: imageSize}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </View>
  )
}

function ApprovedNFT({uri, text}: {text: string; uri: string}) {
  return (
    <>
      <Image source={{uri}} style={[styles.image, {width: imageSize, height: imageSize}]} />
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: imageSize}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </>
  )
}

function SkeletonImagePlaceholder() {
  return (
    <View
      style={[
        styles.imageContainer,
        {width: imageSize + 10, height: imageSize + IMAGE_PADDING + TEXT_SIZE + TEXT_PADDING},
      ]}
    >
      <SkeletonPlaceholder enabled={true}>
        <View>
          <View style={{width: imageSize, height: imageSize, borderRadius: 8}} />
          <View
            style={{
              marginTop: TEXT_PADDING,
              width: (imageSize * 3) / 4,
              height: TEXT_SIZE,
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

const IMAGE_PADDING = 8
const TEXT_PADDING = 13
const TEXT_SIZE = 20

const imageSize = getImageSize()

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
