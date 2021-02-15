// @flow

import React, {useState} from 'react'
import type {Node} from 'react'
import {View, Image, LayoutAnimation, TouchableOpacity} from 'react-native'

import {Text} from '.'

import AssetList from '../Common/assetList/AssetList'
import AssetListStyle from '../Common/assetList/assetListSend.style'

import styles from './styles/AssetSelector.style'
import arrowUp from '../../assets/img/arrow_up_fill.png'
import arrowDown from '../../assets/img/arrow_down_fill.png'
import closeIcon from '../../assets/img/cross_fill.png'

// to be updated later
type tokenType = {|
  assetName: string,
  assetId: string,
  balance: string,
|}

type ExternalProps = {
  label?: string,
  assets: Array<any>,
  onSelect: (tokenType | null) => any, // change to token type
  selectedAsset: tokenType | null
}

const AssetSelector: (ExternalProps) => Node = ({label, assets, onSelect, selectedAsset}) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }
  return (
    <View style={styles.container}>
      <View style={styles.input} onPress={() => toggleExpand()}>
        {selectedAsset == null ? (
          <Text> Select a Token </Text>
        ) : (
          <Text> {selectedAsset.assetName} </Text>
        )}
        <View style={styles.flexRow}>
          <TouchableOpacity style={styles.closeButton} onPress={() => onSelect(null)}>
            <Image source={closeIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.chevronButton} onPress={() => toggleExpand()}>
            <Image source={expanded ? arrowUp : arrowDown} />
          </TouchableOpacity>
        </View>
      </View>
      {label != null && (
        <View style={styles.labelWrap}>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      {expanded && (
        <View style={styles.assetSelection}>
          <AssetList
            onSelect={(item) => {
              onSelect(item)
            }}
            styles={AssetListStyle}
            assets={assets}
          />
        </View>
      )}
    </View>
  )
}

export default AssetSelector
