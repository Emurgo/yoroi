import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, StyleSheet, View} from 'react-native'

import {usePortfolioImage} from '../../Portfolio/common/hooks/usePortfolioImage'
import {Icon} from '../Icon'

type TokenInfoIconProps = {
  info: Portfolio.Token.Info | undefined | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  imageStyle?: ImageStyle
}
export const TokenInfoIcon = ({
  info,
  size = 'lg',
  imageStyle,
}: TokenInfoIconProps) => {
  const {color} = useTheme()
  const [policy, name] = !info ? '.' : info.id.split('.')
  const {uri, headers, onError, onLoad, isError} = usePortfolioImage({
    policy,
    name,
    width: 64,
    height: 64,
  })

  if (!info || isError) {
    return (
      <View
        style={[styles.icon, styles[size], {backgroundColor: color.gray_200}]}
      >
        <Icon.Coins2
          color={color.gray_600}
          size={{sm: 18, md: 20, lg: 24, xl: 42}[size]}
        />
      </View>
    )
  }

  if (isPrimaryToken(info))
    return (
      <View
        style={[
          styles.icon,
          styles[size],
          {backgroundColor: color.primary_500},
          imageStyle,
        ]}
      >
        <Icon.Cardano
          color="white"
          size={{sm: 20, md: 28, lg: 35, xl: 70}[size]}
        />
      </View>
    )

  return (
    <Image
      recyclingKey={info.id}
      source={{uri, headers}}
      contentFit="cover"
      style={[styles.icon, styles[size], imageStyle]}
      placeholder={blurhash}
      cachePolicy="memory-disk"
      onError={onError}
      onLoad={onLoad}
    />
  )
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const styles = StyleSheet.create({
  icon: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    ...a.align_center,
    ...a.justify_center,
    ...a.overflow_hidden,
  },
  xl: {
    width: 80,
    height: 80,
  },
  lg: {
    width: 40,
    height: 40,
  },
  md: {
    width: 32,
    height: 32,
  },
  sm: {
    width: 24,
    height: 24,
  },
} as const)
