import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import {Image} from 'expo-image'
import * as React from 'react'
import {ImageStyle, View} from 'react-native'

import ftPlaceholderDark from '~/assets/img/ft-placeholder-dark.png'
import ftPlaceholderLight from '~/assets/img/ft-placeholder.png'
import nftPlaceholderDark from '~/assets/img/nft-placeholder-dark.png'
import nftPlaceholderLight from '~/assets/img/nft-placeholder.png'
import {usePortfolioImage} from '~/features/Portfolio/common/hooks/usePortfolioImage'

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
  const {isDark, palette: p} = useTheme()

  const [policy, name] = info.id.split('.')
  const {uri, headers, onError, onLoad, isError, isLoading} = usePortfolioImage(
    {
      policy: policy ?? '',
      name: name ?? '',
      width: 512,
      height: 512,
      contentFit,
    },
  )
  const placeholder = getPlaceholder(info.type, isDark)

  return (
    <View style={[{width, height}, a.relative, a.overflow_hidden]}>
      <Image
        source={
          showPlaceholder ? placeholder : uri ? {uri, headers} : placeholder
        }
        contentFit={contentFit}
        placeholderContentFit={contentFit}
        style={{width, height, ...style}}
        blurRadius={blurRadius}
        cachePolicy="memory-disk"
        placeholder={isError ? placeholder : undefined}
        onLoad={onLoad}
        onError={onError}
      />

      {isLoading && (
        <View style={[a.absolute, a.inset_0, a.z_10, {width, height}]}>
          <View
            style={[
              {width, height},
              {backgroundColor: p.gray_100},
              {borderRadius: blurRadius || 0},
            ]}
          />
        </View>
      )}
    </View>
  )
}

const getPlaceholder = (type: Portfolio.Token.Type, isDark: boolean) => {
  if (type === Portfolio.Token.Type.NFT) {
    if (isDark) return nftPlaceholderDark
    return nftPlaceholderLight
  }

  if (isDark) return ftPlaceholderDark
  return ftPlaceholderLight
}
