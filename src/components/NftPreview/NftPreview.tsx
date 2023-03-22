import React from 'react'
import {Image, ImageResizeMode, ImageStyle, StyleProp} from 'react-native'
import {SvgUri} from 'react-native-svg'

import placeholder from '../../assets/img/nft-placeholder.png'
import {isString, YoroiNft} from '../../yoroi-wallets'

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
  height: number
  width?: number
  resizeMode?: ImageResizeMode
  blurRadius?: number
}) => {
  const uri = showThumbnail ? nft.thumbnail : nft.logo
  const isUriSvg = uri?.toLowerCase().endsWith('.svg') || isSvgMediaType(nft.metadata.originalMetadata?.mediaType)
  nft.metadata.originalMetadata?.files?.some((file) => file.src === uri && isSvgMediaType(file.mediaType))

  if (!isString(uri) || showPlaceholder || (isUriSvg && blurRadius !== undefined)) {
    // Since SvgUri does not support blur radius, we show a placeholder
    return <Image source={placeholder} style={[style, {width, height}]} resizeMode={resizeMode ?? 'contain'} />
  }

  if (isUriSvg) {
    // passing width or height with value undefined has a different behavior than not passing it at all
    return (
      <SvgUri
        {...(width !== undefined ? {width} : undefined)}
        height={height}
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

const isSvgMediaType = (mediaType: string | undefined): boolean => {
  return mediaType === 'image/svg+xml'
}
