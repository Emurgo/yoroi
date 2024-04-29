import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {Chain, Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components/Icon'

const headers = {
  Accept: 'image/webp',
} as const

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['

type TokenInfoIconProps = {
  info: Portfolio.Token.Info
  isMainnet?: boolean
  size: 'sm' | 'md'
}
export const TokenInfoIcon = React.memo(({info, isMainnet, size = 'md'}: TokenInfoIconProps) => {
  const {styles} = useStyles()

  if (info.nature === Portfolio.Token.Nature.Primary) return <PrimaryIcon size={size} />

  if (isString(info.icon) && info.icon.length > 0) {
    return (
      <Image
        source={{uri: `data:image/png;base64,${info.icon}`}}
        style={[size === 'sm' ? styles.iconSmall : styles.iconMedium]}
        placeholder={blurhash}
      />
    )
  }

  const [policy, name] = info.id.split('.')
  const network = isMainnet ? Chain.Network.Mainnet : Chain.Network.Preprod
  const uri = `https://${network}.processed-media.yoroiwallet.com/${policy}/${name}?width=64&height=64&kind=metadata&fit=cover`

  return (
    <Image source={{uri, headers}} contentFit="cover" style={[size === 'sm' ? styles.iconSmall : styles.iconMedium]} />
  )
})

const PrimaryIcon = ({size = 'md'}: {size?: 'sm' | 'md'}) => {
  const {styles} = useStyles()
  return (
    <View style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, styles.primary]}>
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

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    primary: {
      backgroundColor: color.primary[600],
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
      backgroundColor: color.gray[100],
    },
    placeholderSmall: {
      width: 24,
      height: 24,
    },
  })

  const colors = {
    icon: color.gray[600],
  }

  return {styles, colors}
}
