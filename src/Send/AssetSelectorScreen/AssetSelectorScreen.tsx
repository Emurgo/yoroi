import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {FlatList, LayoutAnimation, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'

import AdaImage from '../../assets/img/asset_ada.png'
import NoImage from '../../assets/img/asset_no_image.png'
import {Boundary, Button, Spacer, Text, TextInput} from '../../components'
import {useTokenInfo} from '../../hooks'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {decodeHexAscii, formatTokenAmount, getAssetDenominationOrId, getTokenFingerprint} from '../../legacy/format'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {Token, TokenEntry} from '../../types'

type Props = {
  assetTokens: Array<TokenEntry>
  onSelect: (tokenEntry: TokenEntry) => void
  onSelectAll: () => void
}

export const AssetSelectorScreen = ({assetTokens, onSelect, onSelectAll}: Props) => {
  const strings = useStrings()

  const [matcher, setMatcher] = React.useState('')
  const onChangeMatcher = (matcher: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMatcher(matcher)
  }
  const sortedAssetTokens = assetTokens
    .sort((a: TokenEntry, b: TokenEntry) => (a.amount.isGreaterThan(b.amount) ? -1 : 1))
    .sort((assetToken) => (assetToken.identifier === '' ? -1 : 1))

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <SearchInput onChangeText={(text) => onChangeMatcher(normalize(text))} />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: COLORS.GREY_6}}>{strings.assetsLabel}</Text>
          <Text style={{color: COLORS.GREY_6}}>{strings.amount}</Text>
        </View>

        <Spacer height={16} />

        <HR />
      </View>

      <FlatList
        data={sortedAssetTokens}
        renderItem={({item: assetToken}) => (
          <Boundary>
            <AssetSelectorItem
              key={assetToken.identifier}
              assetToken={assetToken}
              onPress={onSelect}
              matcher={matcher}
            />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
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
  onPress: (tokenEntry: TokenEntry) => void
  matcher: string
}
const AssetSelectorItem = ({assetToken, onPress, matcher}: AssetSelectorItemProps) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const tokenInfo = useTokenInfo({wallet, tokenId: assetToken.identifier})

  if (!matches(tokenInfo, matcher)) return null

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={() => onPress(assetToken)}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{padding: 4}}>
          <Icon source={tokenInfo.isDefault ? AdaImage : NoImage} />
        </View>

        <View style={{flex: 1, padding: 4}}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={{color: COLORS.BLUE_LIGHTER}}>
            {getAssetDenominationOrId(tokenInfo) || strings.unknownAsset}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="middle" style={{color: COLORS.TEXT_INPUT}}>
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

const matches = (token: Token, matcher: string) =>
  normalize(decodeHexAscii(token.metadata.assetName) || '').includes(matcher) ||
  normalize(getTokenFingerprint(token) || '').includes(matcher) ||
  normalize(token.metadata.ticker || '').includes(matcher) ||
  normalize(token.metadata.longName || '').includes(matcher) ||
  normalize(token.identifier).includes(matcher) ||
  normalize(token.metadata.assetName).includes(matcher) ||
  normalize(token.metadata.policyId).includes(matcher)

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
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
})
