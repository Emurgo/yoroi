import {FlashList, FlashListProps} from '@shopify/flash-list'
import React, {useEffect} from 'react'
import {Dimensions, GestureResponderEvent, Image, StyleSheet, TouchableOpacity, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholderImage from '../../assets/img/nft-placeholder.png'
import {Icon, Spacer, Text} from '../../components'
import {useNftModerationStatus} from '../../hooks'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNft} from '../../yoroi-wallets/types'

type Props = {
  nfts: YoroiNft[]
  onSelect: (index: number) => void
  onRefresh: () => void
  isRefreshing: boolean
}

const TEXT_SIZE = 20

export const SkeletonGallery = ({amount}: {amount: number} = {amount: 3}) => {
  const placeholders = new Array(amount).fill(undefined).map((val, i) => i)

  return <GalleryList data={placeholders} renderItem={() => <SkeletonImagePlaceholder />} />
}

export const ImageGallery = ({nfts = [], onSelect, onRefresh, isRefreshing}: Props) => {
  return (
    <GalleryList
      data={nfts}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      renderItem={(item) => <ModeratedImage onPress={() => onSelect(nfts.indexOf(item))} nft={item} key={item.id} />}
    />
  )
}

interface ModeratedImageProps {
  onPress?(event: GestureResponderEvent): void
  nft: YoroiNft
}

const ModeratedImage = ({onPress, nft}: ModeratedImageProps) => {
  const {image, name: text, fingerprint} = nft
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

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
    </View>
  )
}

function ManualReviewNft({text}: {text: string}) {
  return (
    <View>
      <Image source={placeholderImage} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
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

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
    </View>
  )
}

function ApprovedNft({uri, text}: {text: string; uri: string}) {
  return (
    <View>
      <Image source={{uri}} style={[styles.image, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} />

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
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

          <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
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
  imageContainer: {},
  image: {
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: TEXT_SIZE,
  },
})

const REFETCH_TIME_IN_MS = 3000
const IMAGE_PADDING = 8
const ROW_SPACING = 14
const NUMBER_OF_COLUMNS = 2
const CONTAINER_HORIZONTAL_PADDING = 16
const SPACE_BETWEEN_COLUMNS = CONTAINER_HORIZONTAL_PADDING
const DIMENSIONS = Dimensions.get('window')
const MIN_SIZE = Math.min(DIMENSIONS.width, DIMENSIONS.height)
const IMAGE_HORIZONTAL_PADDING = SPACE_BETWEEN_COLUMNS / NUMBER_OF_COLUMNS
const IMAGE_SIZE = (MIN_SIZE - CONTAINER_HORIZONTAL_PADDING * 2) / NUMBER_OF_COLUMNS - IMAGE_HORIZONTAL_PADDING

function GalleryList<T>({renderItem, ...rest}: FlashListProps<T> & {renderItem: (item: T) => React.ReactElement}) {
  return (
    <FlashList
      {...rest}
      numColumns={2}
      renderItem={({item, index}) => (
        <View
          style={[
            index % 2 === 0 ? {paddingRight: IMAGE_HORIZONTAL_PADDING} : {paddingLeft: IMAGE_HORIZONTAL_PADDING},
            {paddingBottom: ROW_SPACING},
          ]}
        >
          {renderItem(item)}
        </View>
      )}
      keyExtractor={(placeholder, index) => index + ''}
      horizontal={false}
      estimatedItemSize={IMAGE_SIZE + IMAGE_PADDING + TEXT_SIZE + ROW_SPACING}
    />
  )
}
