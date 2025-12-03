import {
  isPrimaryToken,
  normalizeTokenId,
  usePortfolioTokenInfo,
} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {FlatList, Text, TouchableOpacity, View} from 'react-native'

import {usePrivacyMode} from '~/features/Settings/hooks/usePrivacyMode'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Boundary} from '~/ui/Boundary/Boundary'
import {CardanoTypes} from '@yoroi/cardano-wallet/types'
import {formatTokenAmount} from '@yoroi/cardano-wallet/utils/format'
import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {asQuantity} from '@yoroi/cardano-wallet/utils/utils'

type AssetListProps = {
  assets: Array<CardanoTypes.TokenEntry>
  onSelect?: (tokenEntry: CardanoTypes.TokenEntry) => void
}
export const AssetList = ({assets, onSelect}: AssetListProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <View>
      <View style={[a.flex_row, a.justify_between, {marginBottom: 10}]}>
        <Text style={[{color: p.text_gray_medium}, a.body_2_md_regular]}>
          {strings.transactions.assetsLabel}
        </Text>

        <Text style={[{color: p.text_gray_medium}, a.body_2_md_regular]}>
          {strings.send.amount}
        </Text>
      </View>

      <View>
        <FlatList
          data={assets.sort((asset) =>
            isPrimaryToken(normalizeTokenId(asset.identifier)) ? -1 : 1,
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
  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()
  const {tokenInfo} = usePortfolioTokenInfo({
    id: normalizeTokenId(entry.identifier),
    network: wallet.networkManager.network,
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })
  const isPrimary = isPrimaryToken(tokenInfo?.id)
  const primaryTicker = wallet.portfolioPrimaryTokenInfo.ticker
  const strings = useStrings()
  const {palette: p} = useTheme()

  const name = isEmptyString(tokenInfo?.name)
    ? strings.transactions.unknownAssetName
    : tokenInfo?.name

  const quantity = tokenInfo
    ? formatTokenAmount(asQuantity(entry.amount), tokenInfo)
    : entry.amount.toFormat()
  const protectedQuantity = isPrivacyModeEnabled ? privacyPlaceholder : quantity

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
