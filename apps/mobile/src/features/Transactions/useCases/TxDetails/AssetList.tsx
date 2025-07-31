import {isPrimaryToken, usePortfolioTokenInfo} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useStrings} from '~/features/Transactions/common/strings'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {normalisePtId} from '~/kernel/helpers/normalisePtId'
import globalMessages, {txLabels} from '~/kernel/i18n/global-messages'
import {Boundary} from '~/ui/Boundary/Boundary'
import {CardanoTypes} from '~/wallets/cardano/types'
import {formatTokenAmount} from '~/wallets/utils/format'
import {isEmptyString} from '~/wallets/utils/string'
import {asQuantity} from '~/wallets/utils/utils'

type AssetListProps = {
  assets: Array<CardanoTypes.TokenEntry>
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}
export const AssetList = ({assets, onSelect}: AssetListProps) => {
  const intl = useIntl()
  const {palette: p} = useTheme()

  return (
    <View>
      <View style={[a.flex_row, a.justify_between, {marginBottom: 10}]}>
        <Text style={[{color: p.text_gray_medium}, a.body_2_md_regular]}>
          {intl.formatMessage(globalMessages.assetsLabel)}
        </Text>

        <Text style={[{color: p.text_gray_medium}, a.body_2_md_regular]}>
          {intl.formatMessage(txLabels.amount)}
        </Text>
      </View>

      <View>
        <FlatList
          data={assets.sort((asset) =>
            isPrimaryToken(normalisePtId(asset.identifier)) ? -1 : 1,
          )}
          keyExtractor={(item) => item.identifier}
          renderItem={({item: entry}) => (
            <Boundary loading={{size: 'small', style: {padding: 16}}}>
              <AssetRow entry={entry} onSelect={onSelect} />
            </Boundary>
          )}
        />
      </View>
    </View>
  )
}

type AssetRowProps = {
  entry: CardanoTypes.TokenEntry
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}

const AssetRow = ({entry, onSelect}: AssetRowProps) => {
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
  const {palette: p} = useTheme()

  const name = isEmptyString(tokenInfo?.name)
    ? strings.unknownAssetName
    : tokenInfo?.name

  const quantity = tokenInfo
    ? formatTokenAmount(asQuantity(entry.amount), tokenInfo)
    : entry.amount.toFormat()
  const protectedQuantity = isPrivacyActive ? privacyPlaceholder : quantity

  const item = (
    <>
      <View style={{flex: 2}}>
        <Text
          style={[{color: p.gray_900}, a.body_2_md_regular, {marginBottom: 2}]}
        >
          {isPrimary ? primaryTicker : name}
        </Text>

        <Text
          style={[{color: p.text_gray_medium}, a.link_1_lg]}
          ellipsizeMode="middle"
          numberOfLines={1}
        >
          {isPrimary ? '' : tokenInfo?.fingerprint}
        </Text>
      </View>

      <View style={[a.flex_1, a.align_end, a.justify_start]}>
        <Text style={[{color: p.gray_max}, a.body_2_md_regular]}>
          {protectedQuantity}
        </Text>
      </View>
    </>
  )

  if (onSelect == null) {
    return (
      <View
        style={[a.flex_row, a.justify_between, {paddingVertical: 10}, a.px_0]}
      >
        {item}
      </View>
    )
  } else {
    return (
      <TouchableOpacity
        onPress={() => onSelect(entry)}
        style={[a.flex_row, a.justify_between, {paddingVertical: 10}, a.px_0]}
      >
        {item}
      </TouchableOpacity>
    )
  }
}
