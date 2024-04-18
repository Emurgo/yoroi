import {isString} from '@yoroi/common'
import {Balance} from '@yoroi/types'
import React from 'react'
import {Image, ImageStyle, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholder from '../../assets/img/nft-placeholder.png'
import {useSelectedWallet} from '../../features/WalletManager/Context'
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
}: NftPreviewProps) => {
  const wallet = useSelectedWallet()
  const [policy, name] = nft.id.split('.')
  const {uri, headers, isLoading, isError, onError, onLoad} = useNativeAssetImage({
    networkId: wallet.networkId,
    policy,
    name,
    width: width * zoom,
    height: height * zoom,
    kind: 'metadata',
    contentFit,
    mediaType: getNftMainImageMediaType(nft),
  })

  const shouldShowPlaceholder = !isString(uri) || showPlaceholder || isError

  return (
    <View style={{width, height, overflow: 'hidden'}}>
      {isLoading && (
        <SkeletonPlaceholder enabled={true}>
          <View style={{width, height}} />
        </SkeletonPlaceholder>
      )}

      <Image
        source={shouldShowPlaceholder ? placeholder : {uri, headers}}
        onError={onError}
        onLoad={onLoad}
        style={[style, {width, height}]}
        resizeMode={contentFit}
        blurRadius={blurRadius}
      />
    </View>
  )
}
