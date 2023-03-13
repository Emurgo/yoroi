import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

import {features} from '../../features'
import {COLORS} from '../../theme'
import {useIsTokenKnownNft, useNft, useNftImageModerated, useTokenInfo} from '../../yoroi-wallets'
import {YoroiWallet} from '../../yoroi-wallets'
import {Icon} from '../Icon'
import {ModeratedNftIcon} from './ModeratedNftIcon'

export const TokenIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id
  const isTokenNft = useIsTokenKnownNft({wallet, fingerprint: tokenInfo.fingerprint})

  if (isPrimary) return <PrimaryIcon />
  if (tokenInfo.logo != null && tokenInfo.logo.length > 0 && isBase64(tokenInfo.logo)) {
    return <Image source={{uri: `data:image/png;base64,${tokenInfo.logo}`}} style={styles.icon} />
  }
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (isTokenNft && features.showNftGallery) {
    return features.moderatingNftsEnabled ? (
      <ModeratedIcon wallet={wallet} tokenId={tokenInfo.id} />
    ) : (
      <UnModeratedNftIcon wallet={wallet} tokenId={tokenInfo.id} />
    )
  }
  return <Placeholder />
}

const PrimaryIcon = () => (
  <View style={[styles.icon, styles.primary]}>
    <Icon.Cardano color="white" height={35} width={35} />
  </View>
)

const ModeratedIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nftModeratedImage = useNftImageModerated({wallet, nftId: tokenId})

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!nftModeratedImage) return <ModeratedNftIcon status="pending" />
  return <ModeratedNftIcon image={nftModeratedImage.image} status={nftModeratedImage.status} />
}

const UnModeratedNftIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nft = useNft(wallet, {id: tokenId})
  return <ModeratedNftIcon status="approved" image={nft.image} />
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
})
