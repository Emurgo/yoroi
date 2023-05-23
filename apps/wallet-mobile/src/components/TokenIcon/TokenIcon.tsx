import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

import {features} from '../../features'
import {COLORS} from '../../theme'
import {YoroiWallet} from '../../yoroi-wallets/cardano/types'
import {useNft, useNftImageModerated, useTokenInfo} from '../../yoroi-wallets/hooks'
import {isString} from '../../yoroi-wallets/utils'
import {Boundary} from '../Boundary'
import {Icon} from '../Icon'
import {ModeratedNftIcon} from './ModeratedNftIcon'

export const TokenIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const tokenInfo = useTokenInfo({wallet, tokenId})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  if (isPrimary) return <PrimaryIcon />
  if (tokenInfo.kind === 'ft') {
    if (isString(tokenInfo.icon) && tokenInfo.icon.length > 0 && isBase64(tokenInfo.icon)) {
      return <Image source={{uri: `data:image/png;base64,${tokenInfo.icon}`}} style={styles.icon} />
    }
  }

  if (tokenInfo.kind === 'nft') {
    return (
      <Boundary loading={{fallback: <Placeholder />}}>
        <NftIcon tokenId={tokenId} wallet={wallet} />
      </Boundary>
    )
  }
  return <Placeholder />
}

const PrimaryIcon = () => (
  <View style={[styles.icon, styles.primary]}>
    <Icon.Cardano color="white" height={35} width={35} />
  </View>
)

const NftIcon = ({tokenId, wallet}: {tokenId: string; wallet: YoroiWallet}) => {
  return features.moderatingNftsEnabled ? (
    <ModeratedIcon wallet={wallet} tokenId={tokenId} />
  ) : (
    <UnModeratedNftIcon wallet={wallet} tokenId={tokenId} />
  )
}

const ModeratedIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nftModeratedImage = useNftImageModerated({wallet, nftId: tokenId})
  const nft = useNft(wallet, {id: tokenId})

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!nftModeratedImage) return <ModeratedNftIcon nft={nft} status="pending" />
  return <ModeratedNftIcon nft={nft} status={nftModeratedImage.status} />
}

const UnModeratedNftIcon = ({wallet, tokenId}: {wallet: YoroiWallet; tokenId: string}) => {
  const nft = useNft(wallet, {id: tokenId})
  return <ModeratedNftIcon status="approved" nft={nft} />
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
