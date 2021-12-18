/* eslint-disable react-native/no-inline-styles */
// @flow

import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {FlatList, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'

import AdaImage from '../../../assets/img/asset_ada.png'
import NoImage from '../../../assets/img/asset_no_image.png'
import type {TokenEntry} from '../../../crypto/MultiToken'
import globalMessages, {txLabels} from '../../../i18n/global-messages'
import {COLORS} from '../../../styles/config'
import {type Token} from '../../../types/HistoryTransaction'
import {decodeHexAscii, formatTokenAmount, getAssetDenominationOrId, getTokenFingerprint} from '../../../utils/format'
import {Button, Spacer, Text, TextInput} from '../../UiKit'

type Props = {
  assetTokens: Array<TokenEntry>,
  assetTokenInfos: Dict<Token>,
  onSelect: (TokenEntry) => mixed,
  onSelectAll: () => mixed,
}
export const AssetSelectorScreen = ({assetTokens, assetTokenInfos, onSelect, onSelectAll}: Props) => {
  const intl = useIntl()

  const [filter, setFilter] = React.useState('')
  const visibleAssetTokens = matches(assetTokenInfos, assetTokens, filter)
    .sort((a: TokenEntry, b: TokenEntry) => (a.amount.isGreaterThan(b.amount) ? -1 : 1))
    .sort((a) => (getTokenInfo(assetTokenInfos, a).isDefault ? -1 : 1))

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <SearchInput onChangeText={(text) => setFilter(normalize(text))} />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: COLORS.GREY_6}}>{intl.formatMessage(globalMessages.assetsLabel)}</Text>
          <Text style={{color: COLORS.GREY_6}}>{intl.formatMessage(txLabels.amount)}</Text>
        </View>

        <Spacer height={16} />

        <HR />
      </View>

      <FlatList
        data={visibleAssetTokens}
        renderItem={({item: assetToken}) => (
          <AssetSelectorItem
            key={assetToken.identifier}
            assetToken={assetToken}
            tokenInfo={assetTokenInfos[assetToken.identifier]}
            onPress={onSelect}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={32} />}
        bounces={false}
        contentContainerStyle={{paddingTop: 16, paddingHorizontal: 16}}
        keyExtractor={(item) => item.identifier}
      />

      <Actions>
        <Button outlineOnLight title={intl.formatMessage(messages.sendAllAssets)} onPress={() => onSelectAll()} />
      </Actions>
    </SafeAreaView>
  )
}

export default AssetSelectorScreen

type AssetSelectorItemProps = {
  assetToken: TokenEntry,
  tokenInfo: Token,
  onPress: (TokenEntry) => mixed,
}
const AssetSelectorItem = ({assetToken, tokenInfo, onPress}: AssetSelectorItemProps) => {
  const intl = useIntl()

  return (
    <TouchableOpacity onPress={() => onPress(assetToken)}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{padding: 4}}>
          <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
        </View>

        <View style={{flex: 1, padding: 4}}>
          <Text numberOfLines={1} ellipsizeMode={'middle'} style={{color: COLORS.BLUE_LIGHTER}}>
            {getAssetDenominationOrId(tokenInfo) || intl.formatMessage(messages.unknownAsset)}
          </Text>
          <Text numberOfLines={1} ellipsizeMode={'middle'} style={{color: COLORS.TEXT_INPUT}}>
            {tokenInfo.isDefault ? '' : getTokenFingerprint(tokenInfo)}
          </Text>
        </View>

        <View style={{flex: 1, alignItems: 'flex-end', padding: 4}}>
          <Text style={{color: COLORS.DARK_TEXT}}>{formatTokenAmount(assetToken.amount, tokenInfo, 15)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const HR = (props) => <View {...props} style={{height: 1, backgroundColor: COLORS.GRAY}} />
const Icon = (props) => (
  <Avatar.Image
    {...props}
    size={32}
    style={{alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent'}}
  />
)
const Actions = (props) => <View {...props} style={{padding: 16}} />

const normalize = (text: string) => text.trim().toLowerCase()

const SearchInput = (props) => {
  const intl = useIntl()
  return <TextInput {...props} label={intl.formatMessage(messages.searchLabel)} />
}
const getTokenInfo = (tokenInfos: Dict<Token>, token: TokenEntry) => tokenInfos[token.identifier]
const matches = (tokenInfos: Dict<Token>, tokens: Array<TokenEntry>, filter: string) =>
  tokens.filter((assetToken) => {
    const tokenInfo = getTokenInfo(tokenInfos, assetToken)

    return (
      normalize(decodeHexAscii(tokenInfo.metadata.assetName) || '').includes(filter) ||
      normalize(tokenInfo.metadata.ticker || '').includes(filter) ||
      normalize(tokenInfo.metadata.longName || '').includes(filter) ||
      normalize(tokenInfo.identifier).includes(filter) ||
      normalize(tokenInfo.metadata.assetName).includes(filter) ||
      normalize(tokenInfo.metadata.policyId).includes(filter)
    )
  })

const messages = defineMessages({
  searchLabel: {
    id: 'components.send.assetselectorscreen.searchlabel',
    defaultMessage: '!!!Search by name or subject',
  },
  sendAllAssets: {
    id: 'components.send.assetselectorscreen.sendallassets',
    defaultMessage: '!!!SELECT ALL ASSETS',
  },
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownasset',
    defaultMessage: '!!!Unknown asset',
  },
})
