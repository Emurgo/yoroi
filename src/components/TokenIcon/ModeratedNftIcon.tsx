import React from 'react'
import {StyleSheet, View} from 'react-native'

import {YoroiNft, YoroiNftModerationStatus} from '../../yoroi-wallets/types'
import {NftPreview} from '../NftPreview'
import {Placeholder} from './TokenIcon'

const ICON_SIZE = 32

export const ModeratedNftIcon = ({nft, status}: {nft: YoroiNft; status: YoroiNftModerationStatus}) => {
  if (status === 'pending') {
    return <Placeholder />
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
    return <ManualReviewNftIcon nft={nft} />
  }

  return null
}

function ManualReviewNftIcon({nft}: {nft: YoroiNft}) {
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

function BlockedNftIcon({nft}: {nft: YoroiNft}) {
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

function ApprovedNftIcon({nft}: {nft: YoroiNft}) {
  return (
    <View style={styles.wrapper}>
      <NftPreview nft={nft} height={ICON_SIZE} width={ICON_SIZE} style={styles.assetIcon} resizeMode="cover" />
    </View>
  )
}

function ConsentNftIcon({nft}: {nft: YoroiNft}) {
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
