import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TokenInfo, YoroiNftModerationStatus} from '../../yoroi-wallets/types'
import {NftPreview} from '../NftPreview'

const ICON_SIZE = 32

export const ModeratedNftIcon = ({nft, status}: {nft: TokenInfo; status: YoroiNftModerationStatus}) => {
  if (status === 'pending') {
    return <PlaceholderNftIcon nft={nft} />
  }

  if (status === 'blocked') {
    return <BlockedNftIcon nft={nft} />
  }

  if (status === 'consent') {
    return <ConsentNftIcon nft={nft} />
  }

  if (status === 'approved') {
    return <ApprovedNftIcon nft={nft} />
  }

  if (status === 'manual_review') {
    return <PlaceholderNftIcon nft={nft} />
  }

  return null
}

function PlaceholderNftIcon({nft}: {nft: TokenInfo}) {
  return (
    <View style={styles.wrapper}>
      <NftPreview
        nft={nft}
        height={ICON_SIZE}
        width={ICON_SIZE}
        style={styles.assetIcon}
        showPlaceholder
        resizeMode="cover"
      />
    </View>
  )
}

function BlockedNftIcon({nft}: {nft: TokenInfo}) {
  return <PlaceholderNftIcon nft={nft} />
}

function ApprovedNftIcon({nft}: {nft: TokenInfo}) {
  return (
    <View style={styles.wrapper}>
      <NftPreview nft={nft} height={ICON_SIZE} width={ICON_SIZE} style={styles.assetIcon} resizeMode="cover" />
    </View>
  )
}

function ConsentNftIcon({nft}: {nft: TokenInfo}) {
  return (
    <View style={styles.wrapper}>
      <NftPreview
        nft={nft}
        height={ICON_SIZE}
        width={ICON_SIZE}
        style={styles.assetIcon}
        resizeMode="cover"
        blurRadius={20}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  wrapper: {
    borderRadius: ICON_SIZE,
    overflow: 'hidden',
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
})
