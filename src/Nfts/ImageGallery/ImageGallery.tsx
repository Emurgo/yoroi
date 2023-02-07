import React, {useEffect} from 'react'
import {Dimensions, FlatList, GestureResponderEvent, Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer, Text} from '../../components'
import {useNftModerationStatus} from '../../hooks'
import {getAssetFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNft} from '../../yoroi-wallets/types'
import placeholderImage from './placeholder.png'

type Props = {
  nfts: YoroiNft[]
  onSelect: (index: number) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export const SkeletonGallery = ({amount}: {amount: number} = {amount: 3}) => {
  const placeholders = new Array(amount).fill(undefined).map((val, i) => i)
  return (
    <FlatList
      bounces={false}
      columnWrapperStyle={{paddingBottom: ROW_SPACING}}
      data={placeholders}
      numColumns={2}
      horizontal={false}
      keyExtractor={(placeholder, index) => index + ''}
      renderItem={() => <SkeletonImagePlaceholder />}
    />
  )
}

export const ImageGallery = ({nfts = [], onSelect, onRefresh, isRefreshing}: Props) => {
  return (
    <FlatList
      bounces={false}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      columnWrapperStyle={{paddingBottom: ROW_SPACING}}
      data={nfts}
      numColumns={2}
      horizontal={false}
      keyExtractor={(nft) => nft.id}
      renderItem={({item}) => <ModeratedImage onPress={() => onSelect(nfts.indexOf(item))} nft={item} key={item.id} />}
    />
  )
}

interface ModeratedImageProps {
  onPress?(event: GestureResponderEvent): void
  nft: YoroiNft
}

const ModeratedImage = ({onPress, nft}: ModeratedImageProps) => {
  const {image, name: text, metadata} = nft
  const fingerprint = getAssetFingerprint(metadata.policyId, metadata.assetNameHex)
  const wallet = useSelectedWallet()
  const moderationStatusQuery = useNftModerationStatus({wallet, fingerprint})

  useEffect(() => {
    if (moderationStatusQuery.data === 'pending') {
      const timeout = setTimeout(() => moderationStatusQuery.refetch(), REFETCH_TIME_IN_MS)
      return () => clearTimeout(timeout)
    }
  }, [moderationStatusQuery.data, moderationStatusQuery])

  const isPendingManualReview = moderationStatusQuery.data === 'manual_review'
  const isPendingAutomaticReview = moderationStatusQuery.data === 'pending'

  const isImageApproved = moderationStatusQuery.data === 'approved'
  const isImageWithConsent = moderationStatusQuery.data === 'consent'
  const isImageBlocked = moderationStatusQuery.data === 'blocked'

  const showSkeleton = moderationStatusQuery.isLoading || isPendingAutomaticReview

  if (showSkeleton) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
        <SkeletonImagePlaceholder text={text} />
      </TouchableOpacity>
    )
  }

  if (moderationStatusQuery.isError) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
        <BlockedNft text={text} />
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
      {isImageApproved ? (
        <ApprovedNft text={text} uri={image} />
      ) : isImageWithConsent ? (
        <RequiresConsentNft text={text} uri={image} />
      ) : isImageBlocked ? (
        <BlockedNft text={text} />
      ) : isPendingManualReview ? (
        <ManualReviewNft text={text} />
      ) : null}
    </TouchableOpacity>
  )
}

function BlockedNft({text}: {text: string}) {
  return (
    <View>
      <Image source={placeholderImage} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
    </View>
  )
}

function ManualReviewNft({text}: {text: string}) {
  return (
    <View>
      <Image source={placeholderImage} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
    </View>
  )
}

function RequiresConsentNft({uri, text}: {text: string; uri: string}) {
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
    </View>
  )
}

function ApprovedNft({uri, text}: {text: string; uri: string}) {
  return (
    <View>
      <Image source={{uri}} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
    </View>
  )
}

function SkeletonImagePlaceholder({text}: {text?: string}) {
  if (typeof text !== 'undefined')
    return (
      <View style={styles.imageContainer}>
        <View>
          <SkeletonPlaceholder>
            <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8}} />
          </SkeletonPlaceholder>

          <Spacer height={IMAGE_PADDING} />

          <Text style={[styles.textTop, {width: IMAGE_SIZE}]}>{text}</Text>
        </View>
      </View>
    )

  return (
    <View style={styles.imageContainer}>
      <SkeletonPlaceholder>
        <View>
          <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8}} />

          <View
            style={{
              marginTop: IMAGE_PADDING,
              width: (IMAGE_SIZE * 3) / 4,
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
  imageContainer: {
    paddingHorizontal: 5,
  },
  image: {
    borderRadius: 8,
  },
  textTop: {
    fontSize: 14,
    lineHeight: 22,
  },
})

const REFETCH_TIME_IN_MS = 3000
const IMAGE_PADDING = 8
const ROW_SPACING = 14
const TEXT_SIZE = 20
const NUMBER_OF_COLUMNS = 2
const CONTAINER_HORIZONTAL_PADDING = 16
const DIMENSIONS = Dimensions.get('window')
const MIN_SIZE = Math.min(DIMENSIONS.width, DIMENSIONS.height)
const IMAGE_SIZE = MIN_SIZE / NUMBER_OF_COLUMNS - CONTAINER_HORIZONTAL_PADDING * 2
