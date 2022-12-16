import AssetFingerprint from '@emurgo/cip14-js'
import React from 'react'
import {GestureResponderEvent, Image, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {useQuery} from 'react-query'

import {Text} from '../../components/Text'
import {useSelectedWallet} from '../../SelectedWallet'
import {YoroiNFT, YoroiNFTModerationStatus} from '../../yoroi-wallets/types'

type Props = {
  nfts: YoroiNFT[]
}

export const SkeletonGallery = (props: {amount: number} = {amount: 3}) => {
  const array = [...new Array(props.amount)]
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
        {array.map((item, index) => (
          <SkeletonImagePlaceholder key={index} />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export const ImageGallery = ({nfts = []}: Props) => {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ScrollView bounces={false} contentContainerStyle={styles.galleryContainer}>
        {nfts.map((nft) => {
          const fingerprint = getNFTFingerprint(nft.metadata.policyId, nft.metadata.assetNameHex)
          return <ModeratedNFTImage image={nft.image} fingerprint={fingerprint} text={nft.name} key={fingerprint} />
        })}
      </ScrollView>
    </SafeAreaView>
  )
}
const getNFTFingerprint = (policyId: string, assetNameHex: string) => {
  const assetFingerprint = new AssetFingerprint(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}

interface ModeratedNFTImageProps {
  image: string
  text: string
  onPress?: ((event: GestureResponderEvent) => void) | undefined
  fingerprint: string
}

const ModeratedNFTImage = ({fingerprint, image, text, onPress}: ModeratedNFTImageProps) => {
  const wallet = useSelectedWallet()
  const moderationStatusQuery = useQuery({
    queryKey: ['nft', fingerprint],
    queryFn: () => wallet.fetchNftModerationStatus(fingerprint),
  })

  const showSkeleton = moderationStatusQuery.isLoading
  const isImageApproved = moderationStatusQuery.data === YoroiNFTModerationStatus.GREEN

  if (showSkeleton) {
    return <SkeletonImagePlaceholder />
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.imageContainer}>
      {isImageApproved ? (
        <View>
          <Image source={{uri: image}} style={styles.image} />
          <Text style={styles.textTop}>{text}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.image} />
          <Text style={styles.textTop}>Image is not approved</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

function SkeletonImagePlaceholder() {
  return (
    <SkeletonPlaceholder enabled={true}>
      <TouchableOpacity style={styles.imageContainer}>
        <View>
          <View style={styles.image} />
          <Text style={styles.textTop}>Loading</Text>
        </View>
      </TouchableOpacity>
    </SkeletonPlaceholder>
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
