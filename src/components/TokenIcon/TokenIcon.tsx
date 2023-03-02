import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

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

export const Placeholder = () => (
  <View style={[styles.icon, styles.placeholder]}>
    <Icon.Tokens color={COLORS.TEXT_INPUT} size={35} />
  </View>
)

const isBase64 = (string) => {
  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/i.test(string)
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
