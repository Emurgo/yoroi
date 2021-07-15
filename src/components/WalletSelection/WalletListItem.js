// @flow
import React, {useState} from 'react'
import {TouchableOpacity, Text, View, Image, LayoutAnimation} from 'react-native'

import {isByron, isHaskellShelley, isJormun} from '../../config/config'
import WalletAccountIcon from '../Common/WalletAccountIcon'
import arrowDown from '../../assets/img/arrow_down.png'
import arrowUp from '../../assets/img/arrow_up.png'
import AdaIcon from '../../assets/AdaIcon'
import AssetList from '../Common/MultiAsset/AssetList'

import styles from './styles/WalletListItem.style'
import assetListStyle from '../Common/MultiAsset/styles/Base.style'
import {COLORS} from '../../styles/config'

import type {WalletMeta} from '../../state'
import type {Node} from 'react'
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

type Props = {
  wallet: WalletMeta,
  onPress: (walletMeta: WalletMeta) => any,
}

type WrappedIconProps = {
  icon: Node,
  style?: ViewStyleProp,
}
const WrappedIcon = ({icon, style}: WrappedIconProps) => <View style={[styles.iconWrapper, style]}>{icon}</View>

type WalletItemMeta = {
  type: string,
  icon: Node,
}
const getWalletItemMeta = (walletMeta: WalletMeta): WalletItemMeta => {
  if (isByron(walletMeta.walletImplementationId)) {
    return {
      type: 'Byron',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isHaskellShelley(walletMeta.walletImplementationId)) {
    return {
      type: 'Shelley',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  if (isJormun(walletMeta.walletImplementationId)) {
    return {
      type: 'Jormungandr',
      icon: <AdaIcon height={18} width={18} color={COLORS.WHITE} />,
    }
  }
  throw new Error('getWalletItemMeta:: invalid wallet implementation id')
}

const WalletListItem = ({wallet, onPress}: Props) => {
  const {type, icon} = getWalletItemMeta(wallet)
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }

  // TODO(multi-asset): currently our Store only provides balance and asset
  // info once a wallet is opened and synched. When this component is displayed
  // no wallet is opened yet so we have no way to retrieve this info.
  const assets = []
  //   {
  //     assetName: 'YROI',
  //     assetId: 'tokenhkjshdf',
  //     balance: '2,000',
  //   },
  //   {
  //     assetName: 'ERG',
  //     assetId: 'tokenhkjshdf',
  //     balance: '3,000',
  //   },
  //   {
  //     assetName: 'YRG',
  //     assetId: 'tokenhkjshdf',
  //     balance: '4,000',
  //   },
  // ]

  return (
    <View style={styles.itemContainer}>
      <View style={styles.item}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => onPress(wallet)} style={styles.leftSide}>
          <WalletAccountIcon iconSeed={wallet.checksum.ImagePart} style={styles.walletAvatar} />
          <View style={styles.walletDetails}>
            <Text style={styles.walletName}>{wallet.name}</Text>
            <Text style={styles.walletMeta}>{wallet.checksum ? `${wallet.checksum.TextPart} | ${type}` : type}</Text>
          </View>
        </TouchableOpacity>
        {assets.length > 0 && (
          <TouchableOpacity onPress={() => toggleExpand()} style={styles.rightSide}>
            <Image source={expanded ? arrowUp : arrowDown} />
          </TouchableOpacity>
        )}
      </View>
      {expanded && (
        <View style={styles.expandableView}>
          <View style={styles.walletBalance}>
            <View style={styles.walletAvatar}>
              <WrappedIcon icon={icon} />
            </View>
            <View style={styles.walletDetails}>
              <Text style={styles.walletName}>12.000000</Text>
              <Text style={styles.walletMeta}>Total ADA</Text>
            </View>
          </View>
          {/* $FlowFixMe */}
          <AssetList styles={assetListStyle} assets={assets} />
        </View>
      )}
    </View>
  )
}

export default WalletListItem
