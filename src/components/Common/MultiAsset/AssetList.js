// @flow

import React from 'react'
import {type IntlShape, injectIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import type {TokenEntry} from '../../../crypto/MultiToken'
import globalMessages, {txLabels} from '../../../i18n/global-messages'
import type {Token} from '../../../types/HistoryTransaction'
import {
  ASSET_DENOMINATION,
  formatTokenAmount,
  getAssetDenomination,
  getAssetDenominationOrUnknown,
} from '../../../utils/format'
import assetListSendStyle from './styles/AssetListSend.style'
import assetListTransactionStyle from './styles/AssetListTransaction.style'
import baseStyle from './styles/Base.style'

type NodeStyle = typeof baseStyle | typeof assetListTransactionStyle | typeof assetListSendStyle

type AssetRowProps = {|
  styles: NodeStyle,
  asset: TokenEntry,
  assetMetadata: Token,
  backColor: {|backgroundColor: string|},
  onSelect?: (TokenEntry) => any,
  intl: IntlShape,
|}
const AssetRow = ({styles, asset, assetMetadata, backColor, onSelect, intl}: AssetRowProps) => {
  const item = (
    <>
      <View style={styles.tokenMetaView}>
        <Text style={styles.assetName}>
          {assetMetadata.isDefault
            ? getAssetDenominationOrUnknown(assetMetadata, ASSET_DENOMINATION.TICKER, intl)
            : getAssetDenominationOrUnknown(assetMetadata, ASSET_DENOMINATION.NAME, intl)}
        </Text>
        <Text style={styles.assetMeta} ellipsizeMode="middle" numberOfLines={1}>
          {assetMetadata.isDefault ? '' : getAssetDenomination(assetMetadata, ASSET_DENOMINATION.FINGERPRINT)}
        </Text>
      </View>
      <View style={styles.assetBalanceView}>
        <Text style={styles.assetBalance}>{formatTokenAmount(asset.amount, assetMetadata, 15)}</Text>
      </View>
    </>
  )

  if (onSelect == null) {
    return <View style={[styles.assetRow, styles.py5, styles.px5, backColor]}>{item}</View>
  } else {
    return (
      <TouchableOpacity onPress={() => onSelect(asset)} style={[styles.assetRow, styles.py5, styles.px5, backColor]}>
        {item}
      </TouchableOpacity>
    )
  }
}

type AssetListProps = {
  assets: Array<TokenEntry>,
  assetsMetadata: Dict<Token>,
  styles: NodeStyle,
  onSelect?: (TokenEntry) => any,
  intl: IntlShape,
}

const AssetList = ({assets, assetsMetadata, styles, onSelect, intl}: AssetListProps) => {
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
            />
          )}
        />
      </View>
    </View>
  )
}
export default injectIntl(AssetList)
