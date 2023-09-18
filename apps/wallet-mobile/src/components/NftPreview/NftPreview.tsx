import {Portfolio} from '@yoroi/types'
import {isString} from '@yoroi/wallets'
import React, {useEffect, useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {Image, ImageResizeMode, ImageStyle, StyleProp, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import {SvgUri} from 'react-native-svg'

import placeholder from '../../assets/img/nft-placeholder.png'
import {getNftFilenameMediaType, isSvgMediaType} from '../../yoroi-wallets/cardano/nfts'

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
  nft: Portfolio.Token
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
  const uri = showThumbnail ? nft.info.icon : nft.info.image
  const isUriSvg =
    isString(uri) &&
    (uri.toLowerCase().endsWith('.svg') ||
      isSvgMediaType(nft.info.mediaType) ||
      isSvgMediaType(getNftFilenameMediaType(uri, nft.files)))

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
