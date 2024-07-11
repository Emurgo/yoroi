import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import placeholderLight from '../../../../assets/img/nft-placeholder.png'
import placeholderDark from '../../../../assets/img/nft-placeholder-dark.png'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

type MediaPreviewProps = {
  info: Portfolio.Token.Info
  showPlaceholder?: boolean
  style?: ImageStyle
  height: number
  width: number
  contentFit?: 'cover' | 'contain'
  blurRadius?: number
}

export const MediaPreview = ({
  info,
  showPlaceholder,
  style = {},
  height,
  width,
  contentFit = 'cover',
  blurRadius,
}: MediaPreviewProps) => {
  const {color, isDark} = useTheme()
  const {wallet} = useSelectedWallet()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  const [policy, name] = info.id.split('.')
  const placeholder = isDark ? placeholderDark : placeholderLight
  const uri = showPlaceholder
    ? placeholder
    : `https://${wallet.networkManager.network}.processed-media.yoroiwallet.com/${policy}/${name}?width=512&height=512&kind=metadata&fit=${contentFit}`

  return (
    <View style={{width, height, overflow: 'hidden'}}>
      <Image
        source={{uri, headers}}
        contentFit={contentFit}
        style={{width, height, ...style}}
        blurRadius={blurRadius}
        cachePolicy="memory-disk"
        placeholder={error && placeholder}
        onLoadStart={() => {
          setLoading(true)
        }}
        onLoad={() => {
          setLoading(false)
        }}
        onError={() => {
          setError(true)
        }}
      >
        <SkeletonPlaceholder enabled={loading} borderRadius={blurRadius} highlightColor={color.gray_c200} speed={1000}>
          <View style={{height, width}} />
        </SkeletonPlaceholder>
      </Image>
    </View>
  )
}
const headers = {
  Accept: 'image/webp',
} as const
