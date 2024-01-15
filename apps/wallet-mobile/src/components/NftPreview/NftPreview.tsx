import {isString} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import {Image, ImageStyle} from 'expo-image'
import React, {useEffect, useState} from 'react'
import {View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholder from '../../assets/img/nft-placeholder.png'
import {useSelectedWallet} from '../../SelectedWallet'
import {getNftMainImageMediaType} from '../../yoroi-wallets/cardano/nfts'
import {useNativeAssetImage} from '../../yoroi-wallets/hooks'

type NftPreviewProps = {
  nft: Balance.TokenInfo
  showPlaceholder?: boolean
  style?: ImageStyle
  height: number
  width: number
  contentFit?: 'cover' | 'contain'
  blurRadius?: number
  zoom?: number
  cachePolicy?: 'none' | 'memory' | 'disk' | 'memory-disk'
}

export const NftPreview = ({
  nft,
  showPlaceholder,
  style = {},
  height,
  width,
  contentFit = 'cover',
  blurRadius,
  zoom = 1,
  cachePolicy,
}: NftPreviewProps) => {
  const wallet = useSelectedWallet()
  const [policy, name] = nft.id.split('.')
  const {uri, headers, isLoading, isError} = useNativeAssetImage({
    networkId: wallet.networkId,
    policy,
    name,
    width: width * zoom,
    height: height * zoom,
    kind: 'metadata',
    contentFit,
    mediaType: getNftMainImageMediaType(nft),
  })

  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [uri])

  const shouldShowPlaceholder = !isString(uri) || showPlaceholder || isError || failed

  return (
    <View style={{width, height, overflow: 'hidden'}}>
      {isLoading ? (
        <SkeletonPlaceholder enabled={true}>
          <View style={{width, height}} />
        </SkeletonPlaceholder>
      ) : (
        <Image
          cachePolicy={shouldShowPlaceholder ? 'none' : cachePolicy}
          source={shouldShowPlaceholder ? placeholder : {uri, headers}}
          placeholder={placeholder}
          placeholderContentFit="contain"
          onError={() => setFailed(true)}
          style={[style, {width, height}]}
          contentFit={contentFit}
          blurRadius={blurRadius}
        />
      )}
    </View>
  )
}
