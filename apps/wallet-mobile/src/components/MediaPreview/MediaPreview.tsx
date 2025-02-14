import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, StyleSheet, View} from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

import ftPlaceholderLight from '../../assets/img/ft-placeholder.png'
import ftPlaceholderDark from '../../assets/img/ft-placeholder-dark.png'
import nftPlaceholderLight from '../../assets/img/nft-placeholder.png'
import nftPlaceholderDark from '../../assets/img/nft-placeholder-dark.png'
import {usePortfolioImage} from '../../features/Portfolio/common/hooks/usePortfolioImage'

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
  const {isDark, colorScheme} = useTheme()
  const {styles, colors} = useStyles()

  const [policy, name] = info.id.split('.')
  const {uri, headers, onError, onLoad, isError, isLoading} = usePortfolioImage({
    policy,
    name,
    width: 512,
    height: 512,
    contentFit,
  })
  const placeholder = getPlaceholder(info.type, isDark)

  return (
    <View style={[{width, height}, styles.wrapper]}>
      <Image
        key={colorScheme}
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
        <View style={[styles.skeletonWrapper, {width, height}]}>
          <SkeletonPlaceholder
            enabled
            borderRadius={blurRadius}
            backgroundColor={colors.backgroundColor}
            highlightColor={colors.highlightColor}
            speed={1000}
          >
            <View style={{width, height}} />
          </SkeletonPlaceholder>
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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    wrapper: {
      ...atoms.relative,
      ...atoms.overflow_hidden,
    },
    skeletonWrapper: {
      ...atoms.absolute,
      top: 0,
      left: 0,
      zIndex: 1,
    },
  })

  const colors = {
    backgroundColor: color.gray_100,
    highlightColor: color.gray_200,
  }

  return {styles, colors} as const
}
