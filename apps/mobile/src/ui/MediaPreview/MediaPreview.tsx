import {useTheme} from '@yoroi/theme'
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
      policy,
      name,
      width: 512,
      height: 512,
      contentFit,
    },
  )
  const placeholder = getPlaceholder(info.type, isDark)

  return (
    <View
      style={[{width, height}, {position: 'relative'}, {overflow: 'hidden'}]}
    >
      <Image
        source={{uri: showPlaceholder ? placeholder : uri, headers}}
        contentFit={contentFit}
        placeholderContentFit={contentFit}
        style={{width, height, ...style}}
        blurRadius={blurRadius}
        cachePolicy="memory-disk"
        placeholder={isError && placeholder}
        onLoad={onLoad}
        onError={onError}
      />

      {isLoading && (
        <View
          style={[
            {position: 'absolute', top: 0, left: 0, zIndex: 1, width, height},
          ]}
        >
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
