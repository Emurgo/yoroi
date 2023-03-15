import React from 'react'
import {Image, ImageStyle, StyleProp} from 'react-native'
import {SvgUri} from 'react-native-svg'

import placeholder from '../../assets/img/nft-placeholder.png'
import {YoroiNft} from '../../yoroi-wallets'

export const NftPreview = ({
  nft,
  showPlaceholder,
  style,
  showThumbnail,
  height,
  width,
  resizeMode,
  blurRadius,
}: {
  nft: YoroiNft
  showPlaceholder?: boolean
  style?: StyleProp<ImageStyle>
  showThumbnail?: boolean
  height?: number
  width?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
  blurRadius?: number
}) => {
  if (showPlaceholder) {
    return <Image source={placeholder} style={[style, {width, height}]} resizeMode={resizeMode ?? 'contain'} />
  }

  const uri = showThumbnail ? nft.thumbnail : nft.image
  const isUriSvg =
    uri.toLowerCase().endsWith('.svg') ||
    nft.metadata.originalMetadata?.files?.some((file) => file.src === uri && file.mediaType === 'image/svg+xml')

  if (isUriSvg) {
    // passing width or height with value undefined has a different behavior than not passing it at all
    return (
      <SvgUri
        {...(width !== undefined ? {width} : undefined)}
        {...(height !== undefined ? {height} : undefined)}
        uri={uri}
        style={style}
        preserveAspectRatio="xMinYMin meet"
      />
    )
  }
  return (
    <Image
      blurRadius={blurRadius}
      source={{uri}}
      style={[style, {width, height}]}
      resizeMode={resizeMode ?? 'contain'}
    />
  )
}
