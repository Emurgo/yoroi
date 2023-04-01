import React, {useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {Image, ImageResizeMode, ImageStyle, StyleProp} from 'react-native'
import {SvgUri} from 'react-native-svg'

import placeholder from '../../assets/img/nft-placeholder.png'
import {isArray, isString, YoroiNft} from '../../yoroi-wallets'

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
  const [error, setError] = useState(false)
  const uri = showThumbnail ? nft.thumbnail : nft.logo
  const isUriSvg =
    isString(uri) &&
    (uri.toLowerCase().endsWith('.svg') ||
      isSvgMediaType(nft.metadata.originalMetadata?.mediaType) ||
      isSvgMediaType(getNftFilenameMediaType(nft, uri)))
  const shouldShowPlaceholder = !isString(uri) || showPlaceholder || (isUriSvg && blurRadius !== undefined) || error

  if (shouldShowPlaceholder) {
    // Since SvgUri does not support blur radius, we show a placeholder
    return <PlaceholderImage height={height} style={style} width={width} resizeMode={resizeMode} />
  }

  if (isUriSvg) {
    // passing width or height with value undefined has a different behavior than not passing it at all
    return (
      <ErrorBoundary
        fallback={<PlaceholderImage height={height} style={style} width={width} resizeMode={resizeMode} />}
      >
        <SvgUri
          {...(width !== undefined ? {width} : undefined)}
          height={height}
          uri={uri}
          style={style}
          preserveAspectRatio="xMinYMin meet"
          onError={() => setError(true)}
        />
      </ErrorBoundary>
    )
  }
  return (
    <ErrorBoundary fallback={<PlaceholderImage height={height} style={style} width={width} resizeMode={resizeMode} />}>
      <Image
        blurRadius={blurRadius}
        source={{uri}}
        style={[style, {width, height}]}
        resizeMode={resizeMode ?? 'contain'}
        onError={() => setError(true)}
      />
    </ErrorBoundary>
  )
}

const PlaceholderImage = ({
  style,
  width,
  height,
  resizeMode,
}: {
  style?: StyleProp<ImageStyle>
  height: number
  width?: number
  resizeMode?: ImageResizeMode
}) => <Image source={placeholder} style={[style, {width, height}]} resizeMode={resizeMode ?? 'contain'} />

const isSvgMediaType = (mediaType: string | undefined): boolean => {
  return mediaType === 'image/svg+xml'
}

const getNftFilenameMediaType = (nft: YoroiNft, filename: string): string | undefined => {
  const files = nft.metadata.originalMetadata?.files ?? []
  const file = files.find((file) => {
    return isArray(file.src) ? file.src.join('') === filename : file.src === filename
  })
  return file?.mediaType
}
