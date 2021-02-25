// @flow

import React from 'react'
import {Text, View, FlatList, TouchableOpacity} from 'react-native'
import {injectIntl} from 'react-intl'
import type {Node, ComponentType} from 'react'

import {getAssetNameOrUnknown, formatTokenAmount, getAssetDenomination} from '../../../utils/format'

import baseStyle from './styles/Base.style'
import assetListTransactionStyle from './styles/AssetListTransaction.style'
import assetListSendStyle from './styles/AssetListSend.style'
import globalMessages, {
  txLabels,
} from '../../../i18n/global-messages'
import type {TokenEntry} from '../../../crypto/MultiToken'
import type {Token} from '../../../types/HistoryTransaction'


type NodeStyle = typeof baseStyle | typeof assetListTransactionStyle | typeof assetListSendStyle

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
      <View style={styles.tokenMeta}>
        <Text style={styles.assetName}>
          {getAssetNameOrUnknown(
            assetMetadata,
            intl,
          )}
        </Text>
        <Text style={styles.assetMeta}>{getAssetDenomination(assetMetadata, 'fingerprint')}</Text>
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
        <Text style={styles.assetHeading}>{intl.formatMessage(globalMessages.assetsLabel)}</Text>
        <Text style={styles.assetHeading}>{intl.formatMessage(txLabels.amount)}</Text>
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
