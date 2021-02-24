// @flow

import React from 'react'
import {Text, View, FlatList, TouchableOpacity} from 'react-native'
import {injectIntl} from 'react-intl'

import {getAssetNameOrUnknown, formatTokenAmount} from '../../../utils/format'

import baseStyle from './styles/Base.style'
import assetListTransactionStyle from './styles/AssetListTransaction.style'

import type {TokenEntry} from '../../../crypto/MultiToken'
import type {Token} from '../../../types/HistoryTransaction'
import type {Node, ComponentType} from 'react'

type NodeStyle = typeof baseStyle | typeof assetListTransactionStyle

type Props = {
  assets: Array<TokenEntry>,
  assetsMetadata: Dict<Token>,
  styles: NodeStyle,
  onSelect?: (TokenEntry) => any,
  intl: any,
}

const AssetRow: ({|
  styles: NodeStyle,
  asset: TokenEntry,
  assetMetadata: Token,
  isLast: boolean,
  backColor: {|backgroundColor: string|},
  onSelect?: (TokenEntry) => any,
  intl: injectIntl,
|}) => Node = ({styles, asset, assetMetadata, backColor, onSelect, intl}) => {
  const item = (
    <>
      <View>
        <Text style={styles.assetName}>
          {getAssetNameOrUnknown(
            assetMetadata,
            intl,
          )}
        </Text>
        <Text style={styles.assetMeta}>{asset.identifier}</Text>
      </View>
      <View>
        <Text style={styles.assetBalance}>
          {formatTokenAmount(asset.amount, assetMetadata)}
        </Text>
      </View>
    </>
  )

  if (onSelect == null) {
    return (
      <View style={[styles.assetRow, styles.py5, styles.px5, backColor]}>
        {item}
      </View>
    )
  } else {
    return (
      <TouchableOpacity
        onPress={() => onSelect(asset)}
        style={[styles.assetRow, styles.py5, styles.px5, backColor]}
      >
        {item}
      </TouchableOpacity>
    )
  }
}

const AssetList: (props: Props) => Node = ({
  assets,
  assetsMetadata,
  styles,
  onSelect,
  intl,
}) => {
  const colors = [styles.rowColor1, styles.rowColor2]

  return (
    <View>
      <View style={styles.assetTitle}>
        <Text style={styles.assetHeading}>Assets</Text>
        <Text style={styles.assetHeading}>Amount</Text>
      </View>
      <View>
        <FlatList
          data={assets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <AssetRow
              asset={item}
              assetMetadata={assetsMetadata[item.identifier]}
              styles={styles}
              backColor={colors[index % colors.length]}
              onSelect={onSelect}
              intl={intl}
            />)
          }
        />
      </View>
    </View>
  )
}
export default injectIntl((AssetList: ComponentType<Props>))
