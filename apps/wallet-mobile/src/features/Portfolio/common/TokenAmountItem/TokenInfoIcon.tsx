import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import {Image} from 'expo-image'
import React from 'react'
import {ImageStyle, StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {isDev} from '../../../../kernel/env'
import {logger} from '../../../../kernel/logger/logger'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioImageInvalidate} from '../hooks/usePortfolioImage'

type TokenInfoIconProps = {
  info: Portfolio.Token.Info | undefined | null
  size?: 'sm' | 'md'
  imageStyle?: ImageStyle
}
export const TokenInfoIcon = ({info, size = 'md', imageStyle}: TokenInfoIconProps) => {
  const {styles} = useStyles()
  const {wallet} = useSelectedWallet()
  const {invalidate} = usePortfolioImageInvalidate()

  const [error, setError] = React.useState(false)

  if (error || !info) return <TokenIconPlaceholder size={size} />

  if (isPrimaryToken(info)) return <PrimaryIcon size={size} imageStyle={imageStyle} />

  if (info.originalImage.startsWith('data:image/png;base64'))
    return (
      <Image
        source={{uri: info.originalImage}}
        style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, imageStyle]}
        placeholder={blurhash}
        onError={() => setError(true)}
      />
    )

  const [policy, name] = info.id.split('.')
  const uri = `https://${wallet.networkManager.network}.processed-media.yoroiwallet.com/${policy}/${name}?width=64&height=64&kind=metadata&fit=cover`

  return (
    <Image
      source={{uri, headers}}
      contentFit="cover"
      style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, imageStyle]}
      placeholder={blurhash}
      cachePolicy="memory-disk"
      onError={() => {
        setError(true)
        if (isDev) {
          logger.debug(`invalidating token image ${info.id}`)
          invalidate([info.id])
        }
      }}
    />
  )
}

const PrimaryIcon = ({size = 'md', imageStyle}: {size?: 'sm' | 'md'; imageStyle?: ImageStyle}) => {
  const {styles} = useStyles()
  return (
    <View style={[size === 'sm' ? styles.iconSmall : styles.iconMedium, styles.primary, imageStyle]}>
      <Icon.Cardano color="white" size={size === 'sm' ? 20 : 35} />
    </View>
  )
}

export const TokenIconPlaceholder = ({size = 'md'}: {size?: 'sm' | 'md'}) => {
  const {styles, colors} = useStyles()
  return (
    <View style={[styles.iconMedium, styles.placeholder, size === 'sm' && styles.placeholderSmall]}>
      <Icon.Coins2 color={colors.icon} size={size === 'sm' ? 18 : 24} />
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
      backgroundColor: color.primary_500,
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
      backgroundColor: color.gray_100,
    },
    placeholderSmall: {
      width: 26,
      height: 26,
    },
  })

  const colors = {
    icon: color.gray_600,
  }

  return {styles, colors}
}
