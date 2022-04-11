import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import {Boundary} from '../../components'
import {useTokenInfo} from '../../hooks'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {formatTokenAmount, getName, getTicker, getTokenFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import type {TokenEntry} from '../../types'
import assetListSendStyle from './AssetListSend.style'
import assetListTransactionStyle from './AssetListTransaction.style'
import baseStyle from './Base.style'

type AssetListProps = {
  assets: Array<TokenEntry>
  styles: NodeStyle
  onSelect?: (tokenEntry: TokenEntry) => void
}
export const AssetList = ({assets, styles, onSelect}: AssetListProps) => {
  const intl = useIntl()
  const colors = [styles.rowColor1, styles.rowColor2]

  return (
    <View>
      <View style={styles.assetTitle}>
        <Text style={styles.assetHeading}>{intl.formatMessage(globalMessages.assetsLabel)}</Text>
        <Text style={styles.assetHeading}>{intl.formatMessage(txLabels.amount)}</Text>
      </View>

      <View>
        <FlatList
          data={assets.sort((asset) => (asset.identifier === '' ? -1 : 1))}
          keyExtractor={(item) => item.identifier}
          renderItem={({item: entry, index}) => (
            <Boundary fallbackProps={{size: 'small', style: {padding: 16}}}>
              <AssetRow entry={entry} styles={styles} backColor={colors[index % colors.length]} onSelect={onSelect} />
            </Boundary>
          )}
        />
      </View>
    </View>
  )
}

type NodeStyle = typeof baseStyle | typeof assetListTransactionStyle | typeof assetListSendStyle
type AssetRowProps = {
  styles: NodeStyle
  entry: TokenEntry
  backColor: {backgroundColor: string}
  onSelect?: (tokenEntry: TokenEntry) => void
}
const AssetRow = ({styles, entry, backColor, onSelect}: AssetRowProps) => {
  const intl = useIntl()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: entry.identifier})

  const item = (
    <>
      <View style={styles.tokenMetaView}>
        <Text style={styles.assetName}>
          {tokenInfo.isDefault
            ? getTicker(tokenInfo) || intl.formatMessage(messages.unknownAssetName)
            : getName(tokenInfo) || intl.formatMessage(messages.unknownAssetName)}
        </Text>

        <Text style={styles.assetMeta} ellipsizeMode="middle" numberOfLines={1}>
          {tokenInfo.isDefault ? '' : getTokenFingerprint(tokenInfo)}
        </Text>
      </View>

      <View style={styles.assetBalanceView}>
        <Text style={styles.assetBalance}>{formatTokenAmount(entry.amount, tokenInfo, 15)}</Text>
      </View>
    </>
  )

  if (onSelect == null) {
    return <View style={[styles.assetRow, styles.py5, styles.px5, backColor]}>{item}</View>
  } else {
    return (
      <TouchableOpacity onPress={() => onSelect(entry)} style={[styles.assetRow, styles.py5, styles.px5, backColor]}>
        {item}
      </TouchableOpacity>
    )
  }
}

const messages = defineMessages({
  unknownAssetName: {
    id: 'utils.format.unknownAssetName',
    defaultMessage: '!!![Unknown asset name]',
  },
})
