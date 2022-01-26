// @flow

import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'
import {useSelector} from 'react-redux'

import type {TokenEntry} from '../../../crypto/MultiToken'
import globalMessages, {txLabels} from '../../../i18n/global-messages'
import {availableAssetsSelector} from '../../../selectors'
import type {Token} from '../../../types/HistoryTransaction'
import {formatTokenAmount, getName, getTicker, getTokenFingerprint} from '../../../utils/format'
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
|}
const AssetRow = ({styles, asset, assetMetadata, backColor, onSelect}: AssetRowProps) => {
  const intl = useIntl()
  const item = (
    <>
      <View style={styles.tokenMetaView}>
        <Text style={styles.assetName}>
          {assetMetadata.isDefault
            ? getTicker(assetMetadata) || intl.formatMessage(messages.unknownAssetName)
            : getName(assetMetadata) || intl.formatMessage(messages.unknownAssetName)}
        </Text>

        <Text style={styles.assetMeta} ellipsizeMode="middle" numberOfLines={1}>
          {assetMetadata.isDefault ? '' : getTokenFingerprint(assetMetadata)}
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
}
const AssetList = ({assets, assetsMetadata, styles, onSelect}: AssetListProps) => {
  const intl = useIntl()
  const colors = [styles.rowColor1, styles.rowColor2]
  const availableAssets = useSelector(availableAssetsSelector)

  return (
    <View>
      <View style={styles.assetTitle}>
        <Text style={styles.assetHeading}>{intl.formatMessage(globalMessages.assetsLabel)}</Text>
        <Text style={styles.assetHeading}>{intl.formatMessage(txLabels.amount)}</Text>
      </View>

      <View>
        <FlatList
          data={assets.sort((a) => (assetsMetadata[a.identifier].isDefault ? -1 : 1))}
          keyExtractor={(item) => item.identifier}
          renderItem={({item, index}) => (
            <AssetRow
              asset={item}
              assetMetadata={assetsMetadata[item.identifier] || availableAssets[item.identifier]}
              styles={styles}
              backColor={colors[index % colors.length]}
              onSelect={onSelect}
            />
          )}
        />
      </View>
    </View>
  )
}
export default AssetList

const messages = defineMessages({
  unknownAssetName: {
    id: 'utils.format.unknownAssetName',
    defaultMessage: '!!![Unknown asset name]',
  },
})
