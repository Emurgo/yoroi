import React from 'react'
import {Image, StyleSheet, View} from 'react-native'
import {ActivityIndicator} from 'react-native-paper'

import {useIsTokenKnownNft, useNftImageModerated, useTokenInfo} from '../../hooks'
import {SHOW_NFT_GALLERY} from '../../legacy/config'
import {COLORS} from '../../theme'
import {YoroiWallet} from '../../yoroi-wallets'
import {Icon} from '..'
import {ModeratedNftIcon} from './ModeratedNftIcon'

export const TokenIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const isTokenNft = useIsTokenKnownNft({wallet, fingerprint: tokenInfo.fingerprint})

  if (isPrimary) return <PrimaryIcon />
  if (isTokenNft && SHOW_NFT_GALLERY) return <NftIcon wallet={wallet} tokenId={tokenInfo.id} />
  if (tokenInfo.logo === undefined || tokenInfo.logo.length === 0) return <Placeholder />
  if (isBase64(tokenInfo.logo))
    return <Image source={{uri: `data:image/png;base64,${tokenInfo.logo}`}} style={styles.icon} />
  return <Image source={{uri: tokenInfo.logo}} style={styles.icon} />
}

const PrimaryIcon = () => (
  <View style={[styles.icon, styles.primary]}>
    <Icon.Cardano color="white" height={35} width={35} />
  </View>
)

const NftIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nftModeratedImage = useNftImageModerated({wallet, nftId: tokenId})

  if (!nftModeratedImage) return <ModeratedNftIcon status="pending" />
  return <ModeratedNftIcon image={nftModeratedImage.image} status={nftModeratedImage.status} />
}

export const LoadingIcon = () => {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="small" color="black" />
    </View>
  )
}

export const Placeholder = () => (
  <View style={[styles.icon, styles.placeholder]}>
    <Icon.Tokens color={COLORS.TEXT_INPUT} size={35} />
  </View>
)

const isBase64 = (string) => {
  // https://github.com/validatorjs/validator.js/blob/491d9c0eea23f8401b5739803fb8e55c6860b32b/src/lib/isBase64.js
  const length = string.length
  if (length % 4 !== 0 || /[^A-Z0-9+\\/=]/i.test(string)) {
    return false
  }

  const firstPaddingChar = string.indexOf('=')
  return (
    firstPaddingChar === -1 ||
    firstPaddingChar === length - 1 ||
    (firstPaddingChar === length - 2 && string[length - 1] === '=')
  )
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.SHELLEY_BLUE,
  },
  icon: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 32,
    width: 32,
  },
})
