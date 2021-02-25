// @flow

import React, {useState} from 'react'
import {injectIntl, defineMessages} from 'react-intl'
import {View, Image, LayoutAnimation, TouchableOpacity} from 'react-native'

import {Text} from '../../UiKit'
import AssetList from './AssetList'
import {
  getAssetDenominationOrId,
  ASSET_DENOMINATION,
} from '../../../utils/format'

import styles from './styles/AssetSelector.style'
import assetListStyle from './styles/AssetListSend.style'
import arrowUp from '../../../assets/img/arrow_up_fill.png'
import arrowDown from '../../../assets/img/arrow_down_fill.png'
import closeIcon from '../../../assets/img/cross_fill.png'

import type {TokenEntry} from '../../../crypto/MultiToken'
import type {Token} from '../../../types/HistoryTransaction'
import type {Node, ComponentType} from 'react'

const messages = defineMessages({
  placeHolder: {
    id: 'components.ma.assetSelector.placeHolder',
    defaultMessage: '!!!Select a Token',
  },
})

type ExternalProps = {
  label?: string,
  assets: Array<TokenEntry>,
  assetsMetadata: Dict<Token>,
  onSelect: (TokenEntry | void) => any,
  selectedAsset: TokenEntry | null,
  unselectEnabled: boolean,
  intl: any,
}

const AssetSelector: (ExternalProps) => Node = ({
  label,
  assets,
  assetsMetadata,
  onSelect,
  selectedAsset,
  unselectEnabled,
  intl,
}) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setExpanded(!expanded)
  }
  return (
    <View style={styles.container}>
      <View style={styles.input} >
        {selectedAsset == null ? (
          <Text> {intl.formatMessage(messages.placeHolder)} </Text>
        ) : (
          <Text> {getAssetDenominationOrId(
            assetsMetadata[selectedAsset.identifier],
            ASSET_DENOMINATION.TICKER,
          )} </Text>
        )}
        <View style={styles.flexRow}>
          {unselectEnabled && (
            <TouchableOpacity style={styles.closeButton} onPress={() => onSelect()}>
              <Image source={closeIcon} />
            </TouchableOpacity>
          )}
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
            styles={assetListStyle}
            assets={assets}
            assetsMetadata={assetsMetadata}
          />
        </View>
      )}
    </View>
  )
}

export default injectIntl((AssetSelector: ComponentType<ExternalProps>))
