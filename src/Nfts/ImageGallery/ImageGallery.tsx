import React, {useEffect} from 'react'
import {GestureResponderEvent, Image, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {useQuery} from 'react-query'

import {Spacer, Text} from '../../components'
import {getAssetFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNFT} from '../../yoroi-wallets/types'

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
  return (
    <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
      {nfts.map((nft, index) => {
        const fingerprint = getAssetFingerprint(nft.metadata.policyId, nft.metadata.assetNameHex)
        return (
          <ModeratedImage
            onPress={() => onSelect(index)}
            image={nft.image}
            fingerprint={fingerprint}
            text={nft.name}
            key={fingerprint}
          />
        )
      })}
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
  const moderationStatusQuery = useQuery({
    queryKey: [wallet.id, 'nft', fingerprint],
    queryFn: () => wallet.fetchNftModerationStatus(fingerprint),
  })

  useEffect(() => {
    if (moderationStatusQuery.data === 'pending') {
      moderationStatusQuery.refetch()
    }
  }, [moderationStatusQuery.data, moderationStatusQuery])

  const showSkeleton = moderationStatusQuery.isLoading
  const isImageApproved = moderationStatusQuery.data === 'green'

  if (showSkeleton) {
    return <SkeletonImagePlaceholder />
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
      {isImageApproved ? (
        <>
          <Image source={{uri: image}} style={styles.image} />
          <Spacer height={8} />
          <Text style={styles.textTop}>{text}</Text>
          <Spacer height={13} />
        </>
      ) : (
        <>
          <View style={styles.image} />
          <Spacer height={8} />
          <Text style={styles.textTop}>Image is not approved</Text>
          <Spacer height={13} />
        </>
      )}
    </TouchableOpacity>
  )
}

function SkeletonImagePlaceholder() {
  return (
    <SkeletonPlaceholder enabled={true}>
      <View style={styles.imageContainer}>
        <View style={styles.image} />
        <SkeletonPlaceholder.Item style={styles.textTop} marginTop={8} marginBottom={13}>
          <Text style={styles.textTop}>Loading...</Text>
        </SkeletonPlaceholder.Item>
      </View>
    </SkeletonPlaceholder>
  )
}

const styles = StyleSheet.create({
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
    width: 164,
    borderRadius: 50, // skeleton styling
  },
})
