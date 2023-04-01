import {FlashList, FlashListProps} from '@shopify/flash-list'
import React from 'react'
import {Dimensions, GestureResponderEvent, StyleSheet, TouchableOpacity, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import {Icon, Spacer, Text} from '../../components'
import {NftPreview} from '../../components/NftPreview/NftPreview'
import {features} from '../../features'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNft} from '../../yoroi-wallets/types'
import {useModeratedNftImage} from '../hooks'

type Props = {
  nfts: YoroiNft[]
  onSelect: (index: number) => void
  onRefresh: () => void
  isRefreshing: boolean
}

const TEXT_SIZE = 20

export const SkeletonGallery = ({amount}: {amount: number}) => {
  const placeholders = new Array(amount).fill(undefined).map((val, i) => i)

  return <GalleryList data={placeholders} renderItem={() => <SkeletonImagePlaceholder />} />
}

export const ImageGallery = ({nfts = [], onSelect, onRefresh, isRefreshing}: Props) => {
  return (
    <GalleryList
      data={nfts}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      renderItem={(nft) =>
        features.moderatingNftsEnabled ? (
          <ModeratedImage onPress={() => onSelect(nfts.indexOf(nft))} nft={nft} key={nft.id} />
        ) : (
          <UnModeratedImage onPress={() => onSelect(nfts.indexOf(nft))} nft={nft} key={nft.id} />
        )
      }
    />
  )
}

interface ModeratedImageProps {
  onPress?(event: GestureResponderEvent): void
  nft: YoroiNft
}

const UnModeratedImage = ({onPress, nft}: ModeratedImageProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ApprovedNft nft={nft} />
    </TouchableOpacity>
  )
}

const ModeratedImage = ({onPress, nft}: ModeratedImageProps) => {
  const {name: text, fingerprint} = nft
  const wallet = useSelectedWallet()
  const {isError, status, isLoading} = useModeratedNftImage({wallet, fingerprint})

  const isPendingManualReview = status === 'manual_review'
  const isPendingAutomaticReview = status === 'pending'

  const isImageApproved = status === 'approved'
  const isImageWithConsent = status === 'consent'
  const isImageBlocked = status === 'blocked'

  const showSkeleton = isLoading || isPendingAutomaticReview

  if (showSkeleton) {
    return (
      <TouchableOpacity onPress={onPress}>
        <SkeletonImagePlaceholder text={text} />
      </TouchableOpacity>
    )
  }

  if (isError) {
    return (
      <TouchableOpacity onPress={onPress}>
        <BlockedNft nft={nft} />
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onPress}>
      {isImageApproved ? (
        <ApprovedNft nft={nft} />
      ) : isImageWithConsent ? (
        <RequiresConsentNft nft={nft} />
      ) : isImageBlocked ? (
        <BlockedNft nft={nft} />
      ) : isPendingManualReview ? (
        <ManualReviewNft nft={nft} />
      ) : null}
    </TouchableOpacity>
  )
}

function BlockedNft({nft}: {nft: YoroiNft}) {
  return <PlaceholderNft nft={nft} />
}

function PlaceholderNft({nft}: {nft: YoroiNft}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <NftPreview
          nft={nft}
          showPlaceholder
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{nft.name}</Text>
    </View>
  )
}

function ManualReviewNft({nft}: {nft: YoroiNft}) {
  return <PlaceholderNft nft={nft} />
}

function RequiresConsentNft({nft}: {nft: YoroiNft}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <NftPreview
          showThumbnail
          nft={nft}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.eyeWrapper}>
          <Icon.EyeOff size={20} color="#FFFFFF" />
        </View>
      </View>

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{nft.name}</Text>
    </View>
  )
}

function ApprovedNft({nft}: {nft: YoroiNft}) {
  return (
    <View>
      <View style={styles.imageWrapper}>
        <NftPreview
          resizeMode="cover"
          showThumbnail
          nft={nft}
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          style={styles.image}
        />
      </View>

      <Spacer height={IMAGE_PADDING} />

      <Text style={[styles.text, {width: IMAGE_SIZE}]}>{nft.name}</Text>
    </View>
  )
}

function SkeletonImagePlaceholder({text}: {text?: string}) {
  if (typeof text !== 'undefined')
    return (
      <View>
        <SkeletonPlaceholder>
          <View style={{width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 8}} />
        </SkeletonPlaceholder>

        <Spacer height={IMAGE_PADDING} />

        <Text style={[styles.text, {width: IMAGE_SIZE}]}>{text}</Text>
      </View>
    )

  return (
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
  )
}

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
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
  image: {
    borderRadius: 8,
    overlayColor: '#FFFFFF',
  },
  text: {
    fontSize: 14,
    lineHeight: TEXT_SIZE,
  },
})

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
          style={[index % 2 === 0 ? {paddingRight: IMAGE_HORIZONTAL_PADDING} : {paddingLeft: IMAGE_HORIZONTAL_PADDING}]}
        >
          <View>{renderItem(item)}</View>

          <Spacer height={ROW_SPACING} />
        </View>
      )}
      contentContainerStyle={{paddingHorizontal: CONTAINER_HORIZONTAL_PADDING}}
      keyExtractor={(placeholder, index) => index + ''}
      horizontal={false}
      estimatedItemSize={IMAGE_SIZE + IMAGE_PADDING + TEXT_SIZE + ROW_SPACING}
    />
  )
}
