// @flow

import React, {useState} from 'react'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {View, Image, LayoutAnimation, TouchableOpacity} from 'react-native'

import {Text} from '../../UiKit'
import AssetList from './AssetList'
import {getAssetDenominationOrId} from '../../../utils/format'

import styles from './styles/AssetSelector.style'
import assetListStyle from './styles/AssetListSend.style'
import arrowUp from '../../../assets/img/arrow_up_fill.png'
import arrowDown from '../../../assets/img/arrow_down_fill.png'
import closeIcon from '../../../assets/img/cross_fill.png'

import type {TokenEntry} from '../../../crypto/MultiToken'
import type {Token} from '../../../types/HistoryTransaction'

const messages = defineMessages({
  placeHolder: {
    id: 'components.ma.assetSelector.placeHolder',
    defaultMessage: '!!!Select an asset',
  },
})

type Props = {
  label?: string,
  assets: Array<TokenEntry>,
  assetsMetadata: Dict<Token>,
  onSelect: (TokenEntry | void) => any,
  selectedAsset: TokenEntry | null,
  unselectEnabled: boolean,
  intl: IntlShape,
}

const AssetSelector = ({label, assets, assetsMetadata, onSelect, selectedAsset, unselectEnabled, intl}: Props) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.input} onPress={() => toggleExpand()}>
        {selectedAsset == null ? (
          <Text style={styles.inputText}> {intl.formatMessage(messages.placeHolder)} </Text>
        ) : (
          <Text numberOfLines={1} ellipsizeMode="middle" style={styles.inputText}>
            {' '}
            {getAssetDenominationOrId(assetsMetadata[selectedAsset.identifier])}{' '}
          </Text>
        )}
        <View style={styles.flexRow}>
          {unselectEnabled && (
            <TouchableOpacity style={styles.closeButton} onPress={() => onSelect()}>
              <Image source={closeIcon} />
            </TouchableOpacity>
          )}
          <View style={styles.chevronButton}>
            <Image source={expanded ? arrowUp : arrowDown} />
          </View>
        </View>
      </TouchableOpacity>
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
              toggleExpand()
            }}
            styles={assetListStyle}
            assets={assets}
            assetsMetadata={assetsMetadata}
          />
        </View>
      )}
    </View>
  )
}

export default injectIntl(AssetSelector)
