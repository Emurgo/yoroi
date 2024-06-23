import {isString} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useNft, useTokenInfo} from '../../yoroi-wallets/hooks'
import {Boundary} from '../Boundary'
import {Icon} from '../Icon'
import {ModeratedNftIcon} from './ModeratedNftIcon'

export const TokenIcon = ({wallet, tokenId, variant}: {wallet: YoroiWallet; tokenId: string; variant?: 'swap'}) => {
  const {styles} = useStyles()
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  if (isPrimary) return <PrimaryIcon variant={variant} />
  if (tokenInfo.kind === 'ft') {
    if (isString(tokenInfo.icon) && tokenInfo.icon.length > 0 && isBase64(tokenInfo.icon)) {
      return (
        <Image
          source={{uri: `data:image/png;base64,${tokenInfo.icon}`}}
          style={[variant === 'swap' ? styles.iconSmall : styles.icon]}
        />
      )
    }
  }

  if (tokenInfo.kind === 'nft') {
    return (
      <Boundary loading={{fallback: <TokenIconPlaceholder />}}>
        <NftIcon tokenId={tokenId} wallet={wallet} />
      </Boundary>
    )
  }
  return <TokenIconPlaceholder variant={variant} />
}

type PrimaryIconProps = {
  variant?: 'swap'
}

const PrimaryIcon = ({variant}: PrimaryIconProps) => {
  const {styles} = useStyles()
  return (
    <View style={[variant === 'swap' ? styles.iconSmall : styles.icon, styles.primary]}>
      <Icon.Cardano color="white" height={variant === 'swap' ? 20 : 35} width={variant === 'swap' ? 20 : 35} />
    </View>
  )
}

const NftIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nft = useNft(wallet, {id: tokenId})
  return <ModeratedNftIcon status="approved" nft={nft} />
}

type PlaceholderProps = {
  variant?: 'swap'
}

export const TokenIconPlaceholder = ({variant}: PlaceholderProps) => {
  const {styles, colors} = useStyles()
  return (
    <View style={[styles.icon, styles.placeholder, variant === 'swap' && styles.placeholderSmall]}>
      <Icon.Tokens color={colors.icon} size={35} />
    </View>
  )
}

const isBase64 = (text: string) => {
  // https://github.com/validatorjs/validator.js/blob/491d9c0eea23f8401b5739803fb8e55c6860b32b/src/lib/isBase64.js
  const length = text.length
  if (length % 4 !== 0 || /[^A-Z0-9+\\/=]/i.test(text)) {
    return false
  }

  const firstPaddingChar = text.indexOf('=')
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === length - 1 ||
    (firstPaddingChar === length - 2 && text[length - 1] === '=')
  )
}

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    primary: {
      backgroundColor: color.primary_c600,
    },
    icon: {
      backgroundColor: 'transparent',
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSmall: {
      backgroundColor: 'transparent',
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
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
