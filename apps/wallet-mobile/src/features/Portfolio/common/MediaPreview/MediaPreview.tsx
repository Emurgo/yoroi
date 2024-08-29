import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, StyleSheet, View} from 'react-native'
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
  const {color, isDark, colorScheme} = useTheme()
  const {wallet} = useSelectedWallet()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  const [policy, name] = info.id.split('.')
  const placeholder = isDark ? placeholderDark : placeholderLight
  const uri = showPlaceholder
    ? placeholder
    : `https://${wallet.networkManager.network}.processed-media.yoroiwallet.com/${policy}/${name}?width=512&height=512&kind=metadata&fit=${contentFit}`

  return (
    <View style={[{width, height}, styles.wrapper]}>
      <Image
        key={colorScheme}
        source={{uri, headers}}
        contentFit={contentFit}
        placeholderContentFit={contentFit}
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
          setLoading(false)
        }}
      />

      {loading && (
        <View style={[styles.skeletonWrapper, {width, height}]}>
          <SkeletonPlaceholder enabled borderRadius={blurRadius} highlightColor={color.gray_200} speed={1000}>
            <View style={{width, height}} />
          </SkeletonPlaceholder>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
})

const headers = {
  Accept: 'image/webp',
} as const
