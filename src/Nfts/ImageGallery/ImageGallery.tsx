import React, {useEffect} from 'react'
import {
  Dimensions,
  FlatList,
  GestureResponderEvent,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
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
  onRefresh: () => void
  isRefreshing: boolean
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

export const ImageGallery = ({nfts = [], onSelect, onRefresh, isRefreshing}: Props) => {
  return (
    <FlatList
      bounces={false}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      contentContainerStyle={styles.galleryContainer}
      data={nfts}
      numColumns={2}
      horizontal={false}
      keyExtractor={(nft) => nft.id}
      renderItem={({item}) => {
        const nft1Fingerprint = getAssetFingerprint(item.metadata.policyId, item.metadata.assetNameHex)
        return (
          <View style={styles.row}>
            <ModeratedImage
              onPress={() => onSelect(nfts.indexOf(item))}
              image={item.image}
              fingerprint={nft1Fingerprint}
              text={item.name}
              key={nft1Fingerprint}
            />
          </View>
        )
      }}
    />
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
    <TouchableOpacity disabled={isImageBlocked} onPress={onPress} style={styles.imageContainer}>
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
      <Image source={placeholderImage} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </>
  )
}

function RequiresConsentNFT({uri, text}: {text: string; uri: string}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <Image source={{uri}} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} blurRadius={20} />
        <View style={styles.eyeWrapper}>
          <Icon.EyeOff size={20} color="#FFFFFF" />
        </View>
      </View>
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </View>
  )
}

function ApprovedNFT({uri, text}: {text: string; uri: string}) {
  return (
    <>
      <Image source={{uri}} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />
      <Spacer height={IMAGE_PADDING} />
      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
      <Spacer height={TEXT_PADDING} />
    </>
  )
}

function SkeletonImagePlaceholder() {
  return (
    <View style={styles.imageContainer}>
      <SkeletonPlaceholder enabled={true}>
        <View>
          <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8}} />
          <View
            style={{
              marginTop: IMAGE_PADDING,
              width: (IMAGE_SIZE * 3) / 4,
              height: TEXT_SIZE,
              borderRadius: 8,
              marginBottom: TEXT_PADDING,
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
const TEXT_PADDING = 14
const TEXT_SIZE = 20
const NUMBER_OF_COLUMNS = 2
const CONTAINER_HORIZONTAL_PADDING = 16
const DIMENSIONS = Dimensions.get('window')
const MIN_SIZE = Math.min(DIMENSIONS.width, DIMENSIONS.height)
const IMAGE_SIZE = MIN_SIZE / NUMBER_OF_COLUMNS - CONTAINER_HORIZONTAL_PADDING * 2
