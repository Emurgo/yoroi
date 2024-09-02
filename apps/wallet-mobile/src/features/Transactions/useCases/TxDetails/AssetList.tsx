import {isPrimaryToken} from '@yoroi/portfolio'
import React from 'react'
import {useIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import {Boundary} from '../../../../components'
import globalMessages, {txLabels} from '../../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../../kernel/utils'
import {CardanoTypes} from '../../../../yoroi-wallets/cardano/types'
import {useTokenInfo} from '../../../../yoroi-wallets/hooks'
import {asQuantity} from '../../../../yoroi-wallets/utils'
import {formatTokenAmount} from '../../../../yoroi-wallets/utils/format'
import {usePrivacyMode} from '../../../Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'

type AssetListProps = {
  assets: Array<CardanoTypes.TokenEntry>
  styles: NodeStyle
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
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
            <Boundary loading={{size: 'small', style: {padding: 16}}}>
              <AssetRow entry={entry} styles={styles} backColor={colors[index % colors.length]} onSelect={onSelect} />
            </Boundary>
          )}
        />
      </View>
    </View>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeStyle = any

type AssetRowProps = {
  styles: NodeStyle
  entry: CardanoTypes.TokenEntry
  backColor: {backgroundColor: string}
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}
const AssetRow = ({styles, entry, backColor, onSelect}: AssetRowProps) => {
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const tokenInfo = useTokenInfo({wallet, tokenId: entry.identifier})
  const isPrimary = isPrimaryToken(tokenInfo.id)
  const primaryTicker = wallet.portfolioPrimaryTokenInfo.ticker
  const strings = useStrings()

  const name = isEmptyString(tokenInfo.name) ? strings.unknownAssetName : tokenInfo.name

  const item = (
    <>
      <View style={styles.tokenMetaView}>
        <Text style={styles.assetName}>{isPrimary ? primaryTicker : name}</Text>

        <Text style={styles.assetMeta} ellipsizeMode="middle" numberOfLines={1}>
          {isPrimary ? '' : tokenInfo.fingerprint}
        </Text>
      </View>

      <View style={styles.assetBalanceView}>
        <Text style={styles.assetBalance}>
          {isPrivacyActive ? privacyPlaceholder : formatTokenAmount(asQuantity(entry.amount), tokenInfo)}
        </Text>
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
