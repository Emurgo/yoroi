import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {FlatList, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'

import AdaImage from '../../../legacy/assets/img/asset_ada.png'
import NoImage from '../../../legacy/assets/img/asset_no_image.png'
import {Button, Spacer, Text, TextInput} from '../../../legacy/components/UiKit'
import globalMessages, {txLabels} from '../../../legacy/i18n/global-messages'
import {COLORS} from '../../../legacy/styles/config'
import {
  decodeHexAscii,
  formatTokenAmount,
  getAssetDenominationOrId,
  getTokenFingerprint,
} from '../../../legacy/utils/format'
import {Token, TokenEntry} from '../../types/cardano'

type Props = {
  assetTokens: Array<TokenEntry>
  assetTokenInfos: Record<string, Token>
  onSelect: (tokenEntry: TokenEntry) => void
  onSelectAll: () => void
}

export const AssetSelectorScreen = ({assetTokens, assetTokenInfos, onSelect, onSelectAll}: Props) => {
  const strings = useStrings()

  const [filter, setFilter] = React.useState('')
  const visibleAssetTokens = matches(assetTokenInfos, assetTokens, filter)
    .sort((a: TokenEntry, b: TokenEntry) => (a.amount.isGreaterThan(b.amount) ? -1 : 1))
    .sort((a) => (getTokenInfo(assetTokenInfos, a).isDefault ? -1 : 1))

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <SearchInput onChangeText={(text) => setFilter(normalize(text))} />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: COLORS.GREY_6}}>{strings.assetsLabel}</Text>
          <Text style={{color: COLORS.GREY_6}}>{strings.amount}</Text>
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
        <Button outlineOnLight title={strings.sendAllAssets} onPress={() => onSelectAll()} />
      </Actions>
    </SafeAreaView>
  )
}

type AssetSelectorItemProps = {
  assetToken: TokenEntry
  tokenInfo: Token
  onPress: (tokenEntry: TokenEntry) => void
}
const AssetSelectorItem = ({assetToken, tokenInfo, onPress}: AssetSelectorItemProps) => {
  const strings = useStrings()

  return (
    <TouchableOpacity onPress={() => onPress(assetToken)}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{padding: 4}}>
          <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
        </View>

        <View style={{flex: 1, padding: 4}}>
          <Text numberOfLines={1} ellipsizeMode={'middle'} style={{color: COLORS.BLUE_LIGHTER}}>
            {getAssetDenominationOrId(tokenInfo) || strings.unknownAsset}
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
  const strings = useStrings()

  return <TextInput {...props} label={strings.searchLabel} />
}
const getTokenInfo = (tokenInfos: Record<string, Token>, token: TokenEntry) => tokenInfos[token.identifier]
const matches = (tokenInfos: Record<string, Token>, tokens: Array<TokenEntry>, filter: string) =>
  tokens.filter((assetToken) => {
    const tokenInfo = getTokenInfo(tokenInfos, assetToken)

    return (
      normalize(decodeHexAscii(tokenInfo.metadata.assetName) || '').includes(filter) ||
      normalize(getTokenFingerprint(tokenInfo) || '').includes(filter) ||
      normalize(tokenInfo.metadata.ticker || '').includes(filter) ||
      normalize(tokenInfo.metadata.longName || '').includes(filter) ||
      normalize(tokenInfo.identifier).includes(filter) ||
      normalize(tokenInfo.metadata.assetName).includes(filter) ||
      normalize(tokenInfo.metadata.policyId).includes(filter)
    )
  })

const useStrings = () => {
  const intl = useIntl()

  return {
    searchLabel: intl.formatMessage(messages.searchLabel),
    sendAllAssets: intl.formatMessage(messages.sendAllAssets),
    unknownAsset: intl.formatMessage(messages.unknownAsset),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
    amount: intl.formatMessage(txLabels.amount),
  }
}

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
