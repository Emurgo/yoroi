import {isPrimaryToken, usePortfolioTokenInfo} from '@yoroi/portfolio'
import React from 'react'
import {useIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {normalisePtId} from '../../../../kernel/helpers/normalisePtId'
import globalMessages, {txLabels} from '../../../../kernel/i18n/global-messages'
import {isEmptyString} from '../../../../kernel/utils'
import {CardanoTypes} from '../../../../yoroi-wallets/cardano/types'
import {formatTokenAmount} from '../../../../yoroi-wallets/utils/format'
import {asQuantity} from '../../../../yoroi-wallets/utils/utils'
import {usePrivacyMode} from '../../../Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from '../../common/strings'
import {useAssetListStyles} from './AssetListTransaction.style'

type AssetListProps = {
  assets: Array<CardanoTypes.TokenEntry>
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}
export const AssetList = ({assets, onSelect}: AssetListProps) => {
  const intl = useIntl()
  const styles = useAssetListStyles()
  const colors = [styles.rowColor1, styles.rowColor2]

  return (
    <View>
      <View style={styles.assetTitle}>
        <Text style={styles.assetHeading}>{intl.formatMessage(globalMessages.assetsLabel)}</Text>

        <Text style={styles.assetHeading}>{intl.formatMessage(txLabels.amount)}</Text>
      </View>

      <View>
        <FlatList
          data={assets.sort((asset) => (isPrimaryToken(normalisePtId(asset.identifier)) ? -1 : 1))}
          keyExtractor={(item) => item.identifier}
          renderItem={({item: entry, index}) => (
            <Boundary loading={{size: 'small', style: {padding: 16}}}>
              <AssetRow entry={entry} backColor={colors[index % colors.length]} onSelect={onSelect} />
            </Boundary>
          )}
        />
      </View>
    </View>
  )
}

type AssetRowProps = {
  entry: CardanoTypes.TokenEntry
  backColor: {backgroundColor: string}
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}

const AssetRow = ({entry, backColor, onSelect}: AssetRowProps) => {
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()
  const {tokenInfo} = usePortfolioTokenInfo({
    id: normalisePtId(entry.identifier),
    network: wallet.networkManager.network,
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })
  const isPrimary = isPrimaryToken(tokenInfo?.id)
  const primaryTicker = wallet.portfolioPrimaryTokenInfo.ticker
  const strings = useStrings()
  const styles = useAssetListStyles()

  const name = isEmptyString(tokenInfo?.name) ? strings.unknownAssetName : tokenInfo?.name

  const quantity = tokenInfo ? formatTokenAmount(asQuantity(entry.amount), tokenInfo) : entry.amount.toFormat()
  const protectedQuantity = isPrivacyActive ? privacyPlaceholder : quantity

  const item = (
    <>
      <View style={styles.tokenMetaView}>
        <Text style={styles.assetName}>{isPrimary ? primaryTicker : name}</Text>

        <Text style={styles.assetMeta} ellipsizeMode="middle" numberOfLines={1}>
          {isPrimary ? '' : tokenInfo?.fingerprint}
        </Text>
      </View>

      <View style={styles.assetBalanceView}>
        <Text style={styles.assetBalance}>{protectedQuantity}</Text>
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
