import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {isEmptyString} from '../../../../kernel/utils'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'

type TokenInfoIconProps = {
  info: Portfolio.Token.Info
  size?: 'sm' | 'md'
  imageStyle?: ImageStyle
}
export const TokenInfoIcon = ({info, size = 'md', imageStyle}: TokenInfoIconProps) => {
  const {styles} = useStyles()
  const {networkManager} = useSelectedWallet()

  if (isPrimaryToken(info)) return <PrimaryIcon size={size} imageStyle={imageStyle} />

  if (info.originalImage.startsWith('data:image/png;base64'))
    return (
      <Image
        source={{uri: info.originalImage}}
        style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, imageStyle]}
        placeholder={blurhash}
      />
    )

  if (!isEmptyString(info.icon)) {
    return (
      <Image
        source={{uri: `data:image/png;base64,${info.icon}`}}
        style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, imageStyle]}
        placeholder={blurhash}
      />
    )
  }

  const [policy, name] = info.id.split('.')
  const uri = `https://${networkManager.network}.processed-media.yoroiwallet.com/${policy}/${name}?width=64&height=64&kind=metadata&fit=cover`

  return (
    <Image
      source={{uri, headers}}
      contentFit="cover"
      style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, imageStyle]}
      placeholder={blurhash}
      cachePolicy="memory-disk"
    />
  )
}

const PrimaryIcon = ({size = 'md', imageStyle}: {size?: 'sm' | 'md'; imageStyle?: ImageStyle}) => {
  const {styles} = useStyles()
  return (
    <View style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, styles.primary, imageStyle]}>
      <Icon.Cardano color="white" height={size === 'sm' ? 20 : 35} width={size === 'sm' ? 20 : 35} />
    </View>
  )
}

export const TokenIconPlaceholder = ({size = 'md'}: {size?: 'sm' | 'md'}) => {
  const {styles, colors} = useStyles()
  return (
    <View style={[styles.iconMedium, styles.placeholder, size === 'sm' && styles.placeholderSmall]}>
      <Icon.Tokens color={colors.icon} size={35} />
    </View>
  )
}

const headers = {
  Accept: 'image/webp',
} as const

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    primary: {
      backgroundColor: color.primary_c600,
    },
    iconMedium: {
      backgroundColor: 'transparent',
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    iconSmall: {
      backgroundColor: 'transparent',
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    placeholder: {
      backgroundColor: color.gray_c100,
    },
    placeholderSmall: {
      width: 24,
      height: 24,
    },
  })

  const colors = {
    icon: color.gray_c600,
  }

  return {styles, colors}
}
