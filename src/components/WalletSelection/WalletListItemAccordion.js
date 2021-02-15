// @flow
import React, {useState} from 'react'
import {
  TouchableOpacity,
  Text,
  View,
  Image,
  LayoutAnimation,
} from 'react-native'

import {WALLET_IMPLEMENTATION_REGISTRY} from '../../config/types'
import WalletAccountIcon from '../Common/WalletAccountIcon'
import arrowDown from '../../assets/img/arrow_down.png'
import arrowUp from '../../assets/img/arrow_up.png'
import AdaIcon from '../../assets/AdaIcon'

import AssetList from '../Common/assetList/AssetList'
import AssetListStyle from '../Common/assetList/base.style'

import styles from './styles/WalletListItemAccordion.style'
import CardanoIcon from '../../assets/CardanoIcon'
import {COLORS} from '../../styles/config'

import type {WalletMeta} from '../../state'
import type {Node} from 'react'

type props = {
  wallet: WalletMeta,
  onPress: (WalletMeta) => any,
}

type WalletItemMeta = {
  type: string,
  iconName: string,
  icon: Node,
}

const adaIcon = (
  <View style={styles.adaIconWrapper}>
    <AdaIcon height={18} width={18} color={COLORS.WHITE} />
  </View>
)

const getWalletItemMeta = (walletMeta: WalletMeta): WalletItemMeta => {
  switch (walletMeta.walletImplementationId) {
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      return {
        type: 'Byron',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Cardano, ADA',
      }
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
      return {
        type: 'Shelley',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Cardano, ADA',
      }
    case WALLET_IMPLEMENTATION_REGISTRY.JORMUNGANDR_ITN:
      return {
        type: 'ITN',
        icon: <CardanoIcon height={16} width={16} color={COLORS.WHITE} />,
        iconName: 'Testnet, ADA',
      }
    default:
      throw new Error('getWalletItemMeta:: invalid wallet implementation id')
  }
}

const WalletListItem: (props) => Node = ({wallet, onPress}) => {
  const {type, icon, iconName} = getWalletItemMeta(wallet)
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  const assets = [
    {
      assetName: 'YROI',
      assetId: 'tokenhkjshdf',
      balance: '2,000',
    },
    {
      assetName: 'ERG',
      assetId: 'tokenhkjshdf',
      balance: '3,000',
    },
    {
      assetName: 'YRG',
      assetId: 'tokenhkjshdf',
      balance: '4,000',
    },
  ]

  return (
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => onPress(wallet)}
          style={styles.leftSide}
        >
          <WalletAccountIcon
            iconSeed={wallet.checksum.ImagePart}
            style={styles.walletAvatar}
          />
          <View style={styles.walletDetails}>
            <Text style={styles.walletName}>{wallet.name}</Text>
            <Text style={styles.walletMeta}>
              {wallet.checksum ? `${wallet.checksum.TextPart} | ${type}` : type}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleExpand()}
          style={styles.rightSide}
        >
          <Image source={expanded ? arrowUp : arrowDown} />
        </TouchableOpacity>
      </View>
      {expanded && (
        <View style={styles.expandableView}>
          <View style={styles.walletBalance}>
            <View style={styles.walletAvatar}>{adaIcon}</View>
            <View style={styles.walletDetails}>
              <Text style={styles.walletName}>12.000000</Text>
              <Text style={styles.walletMeta}>Total ADA</Text>
            </View>
          </View>
          <AssetList styles={AssetListStyle} assets={assets} />
        </View>
      )}
    </View>
  )
}

export default WalletListItem
