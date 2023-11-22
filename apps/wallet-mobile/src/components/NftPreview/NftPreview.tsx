import {isString} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import React from 'react'
import {Image, ImageStyle, StyleProp, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholder from '../../assets/img/nft-placeholder.png'
import {useSelectedWallet} from '../../SelectedWallet'
import {getNftMainImageMediaType} from '../../yoroi-wallets/cardano/nfts'
import {useNativeAssetImage} from '../../yoroi-wallets/hooks'

type NftPreviewProps = {
  nft: Balance.TokenInfo
  showPlaceholder?: boolean
  style?: StyleProp<ImageStyle>
  height: number
  width: number
  resizeMode?: 'cover' | 'contain'
  blurRadius?: number
  zoom?: 1 | 2 | 3
}

export const NftPreview = ({
  nft,
  showPlaceholder,
  style,
  height,
  width,
  resizeMode = 'cover',
  blurRadius,
  zoom = 1,
}: NftPreviewProps) => {
  const wallet = useSelectedWallet()
  const [policy, name] = nft.id.split('.')
  const {uri, isLoading, isError} = useNativeAssetImage({
    networkId: wallet.networkId,
    policy,
    name,
    width: width * zoom,
    height: height * zoom,
    kind: 'metadata',
    resizeMode,
    mediaType: getNftMainImageMediaType(nft),
  })

  const shouldShowPlaceholder = !isString(uri) || showPlaceholder || isError

  return (
    <View style={{width, height, overflow: 'hidden'}}>
      {isLoading ? (
        <SkeletonPlaceholder enabled={true}>
          <View style={{width, height}} />
        </SkeletonPlaceholder>
      ) : (
        <Image
          source={shouldShowPlaceholder ? placeholder : {uri}}
          style={[style, {width, height}]}
          resizeMode={resizeMode}
          blurRadius={blurRadius}
        />
      )}
    </View>
  )
}
