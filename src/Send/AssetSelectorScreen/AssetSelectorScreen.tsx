import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Button, Spacer, Text, TextInput} from '../../components'
import {AssetItem, AssetItemProps} from '../../components/AssetItem'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {sortTokenInfos} from '../../utils'
import {useBalances, useTokenInfos} from '../../yoroi-wallets'
import {TokenInfo} from '../../yoroi-wallets/types'
import {Amounts} from '../../yoroi-wallets/utils'
import {useSend} from '../Context/SendContext'

export const AssetSelectorScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const [matcher, setMatcher] = React.useState('')
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {tokenSelected, allTokensSelected} = useSend()
  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const assets = sortTokenInfos({wallet, tokenInfos}).filter((tokenInfo) => matches(tokenInfo, matcher))

  const onChangeMatcher = (matcher: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMatcher(matcher)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <SearchInput onChangeText={(text) => onChangeMatcher(text)} />

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: COLORS.GREY_6}}>{strings.assetsLabel}</Text>

          <Text style={{color: COLORS.GREY_6}}>{strings.amount}</Text>
        </View>

        <Spacer height={16} />

        <HR />
      </View>

      <FlashList
        data={assets}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem
              tokenInfo={tokenInfo}
              onSelect={() => {
                tokenSelected(tokenInfo.id)
                navigation.navigate('send')
              }}
              balance={balances[tokenInfo.id]}
            />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
      />

      <Actions>
        <Button
          outlineOnLight
          title={strings.sendAllAssets}
          onPress={() => {
            allTokensSelected()
            navigation.navigate('send')
          }}
          testID="sendAllAssetsButton"
        />
      </Actions>
    </SafeAreaView>
  )
}

type SelectableAssetItemProps = AssetItemProps & {
  onSelect(): void
}
const SelectableAssetItem = ({tokenInfo, balance, onSelect}: SelectableAssetItemProps) => {
  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="assetSelectorItem">
      <AssetItem tokenInfo={tokenInfo} balance={balance} />
    </TouchableOpacity>
  )
}

const HR = (props) => <View {...props} style={{height: 1, backgroundColor: COLORS.GRAY}} />

const Actions = (props) => <View {...props} style={{padding: 16}} />

const SearchInput = (props) => {
  const strings = useStrings()

  return <TextInput {...props} label={strings.searchLabel} />
}

const matches = (tokenInfo: TokenInfo, matcher: string) =>
  Object.values(tokenInfo)
    .filter((value): value is string | number => value != null)
    .some((value) => normalize(value).includes(normalize(matcher)))

const normalize = (text: string | number) => String(text).trim().toLocaleLowerCase()

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
