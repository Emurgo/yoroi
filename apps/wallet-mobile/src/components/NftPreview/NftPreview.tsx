import React, {useEffect, useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {Image, ImageResizeMode, ImageStyle, StyleProp, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {SvgUri} from 'react-native-svg'

import placeholder from '../../assets/img/nft-placeholder.png'
import {YoroiNft} from '../../yoroi-wallets/types'
import {isArray, isString} from '../../yoroi-wallets/utils'

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
  width: number
  resizeMode?: ImageResizeMode
  blurRadius?: number
}) => {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const uri = showThumbnail ? nft.thumbnail : nft.logo
  const isUriSvg =
    isString(uri) &&
    (uri.toLowerCase().endsWith('.svg') ||
      isSvgMediaType(nft.metadata.originalMetadata?.mediaType) ||
      isSvgMediaType(getNftFilenameMediaType(nft, uri)))
  const shouldShowPlaceholder = !isString(uri) || showPlaceholder || (isUriSvg && blurRadius !== undefined) || error

  useEffect(() => {
    setLoading(true)
  }, [uri])

  if (shouldShowPlaceholder) {
    // Since SvgUri does not support blur radius, we show a placeholder
    return <PlaceholderImage height={height} style={style} width={width} resizeMode={resizeMode} />
  }

  return (
    <ErrorBoundary fallback={<PlaceholderImage height={height} style={style} width={width} resizeMode={resizeMode} />}>
      <View style={{width, height, overflow: 'hidden'}}>
        {loading ? (
          <SkeletonPlaceholder enabled={true}>
            <View style={{width, height}} />
          </SkeletonPlaceholder>
        ) : null}

        {isUriSvg ? (
          <SvgUri
            {...(width !== undefined ? {width} : undefined)}
            height={height}
            uri={uri}
            style={style}
            preserveAspectRatio="xMinYMin meet"
            onError={() => setError(true)}
            onLoad={() => setLoading(false)}
          />
        ) : (
          <Image
            blurRadius={blurRadius}
            source={{uri}}
            style={[style, {width, height}]}
            resizeMode={resizeMode ?? 'contain'}
            onError={() => setError(true)}
            onLoadEnd={() => setLoading(false)}
          />
        )}
      </View>
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
