import React from 'react'
import {Image, StyleSheet} from 'react-native'
import {Avatar} from 'react-native-paper'

import NftPlaceholder from '../../assets/img/nft-placeholder.png'
import {YoroiNftModerationStatus} from '../../yoroi-wallets/types'
import {Placeholder} from './TokenIcon'

export const ModeratedNftIcon = ({image, status}: {image?: string; status: YoroiNftModerationStatus}) => {
  if (image === undefined) {
    return <PlaceholderIcon />
  }

  if (status === 'pending') {
    return <Placeholder />
  }

  if (status === 'blocked') {
    return <BlockedNftIcon />
  }

  if (status === 'consent') {
    return <ConsentNftIcon image={image} />
  }

  if (status === 'approved') {
    return <ApprovedNftIcon image={image} />
  }

  if (status === 'manual_review') {
    return <ManualReviewNftIcon />
  }

  return null
}

function ManualReviewNftIcon() {
  return <PlaceholderIcon />
}

function BlockedNftIcon() {
  return <PlaceholderIcon />
}

function PlaceholderIcon() {
  return <Icon source={NftPlaceholder} />
}

function ApprovedNftIcon({image}: {image: string}) {
  return <Icon source={{uri: image}} />
}

function ConsentNftIcon({image}: {image: string}) {
  return <Image source={{uri: image}} style={styles.assetIcon} blurRadius={20} borderRadius={32} />
}

const styles = StyleSheet.create({
  assetIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 32,
    width: 32,
  },
})

const Icon = (props) => <Avatar.Image {...props} size={32} style={styles.assetIcon} />
