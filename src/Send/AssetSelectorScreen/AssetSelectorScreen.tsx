import {useNavigation} from '@react-navigation/native'
import BigNumber from 'bignumber.js'
import React from 'react'
import {defineMessages} from 'react-intl'
import {useIntl} from 'react-intl'
import {FlatList, LayoutAnimation, TouchableOpacity, View} from 'react-native'
import {Avatar} from 'react-native-paper'
import {SafeAreaView} from 'react-native-safe-area-context'

import AdaImage from '../../assets/img/asset_ada.png'
import NoImage from '../../assets/img/asset_no_image.png'
import {Boundary, Button, Spacer, Text, TextInput} from '../../components'
import {useBalance, useBalances, useTokenInfos} from '../../hooks'
import globalMessages, {txLabels} from '../../i18n/global-messages'
import {formatTokenAmount} from '../../legacy/format'
import {TxHistoryRouteNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {alpha, toEnd, toStart} from '../../TxHistory/AssetList/utils'
import {toToken, YoroiWallet} from '../../yoroi-wallets'
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
  const sortedTokenInfos = tokenInfos
    .sort(alpha((tokenInfo) => tokenInfo.name?.toLocaleLowerCase() ?? ''))
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    .sort(toEnd((tokenInfo) => !tokenInfo.name))
    .sort(toStart((tokenInfo) => tokenInfo.id === wallet.primaryTokenInfo.id))

  const onChangeMatcher = (matcher: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMatcher(matcher)
  }

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
        data={sortedTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <AssetSelectorItem
              wallet={wallet}
              tokenInfo={tokenInfo}
              onSelect={() => {
                tokenSelected(tokenInfo.id)
                navigation.navigate('send')
              }}
              matcher={matcher}
            />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(tokenInfo) => tokenInfo.id}
        testID="assetsList"
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

type AssetSelectorItemProps = {
  wallet: YoroiWallet
  tokenInfo: TokenInfo
  onSelect: () => void
  matcher: string
}

const AssetSelectorItem = ({wallet, tokenInfo, onSelect, matcher}: AssetSelectorItemProps) => {
  const quantity = useBalance({wallet, tokenId: tokenInfo.id})
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!matches(tokenInfo, matcher)) return null

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="assetSelectorItem">
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{padding: 4}}>
          <Icon source={isPrimary ? AdaImage : NoImage} />
        </View>

        <View style={{flex: 1, padding: 4}}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={{color: COLORS.BLUE_LIGHTER}} testID="tokenInfoText">
            {/* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions */}
            {tokenInfo.ticker || tokenInfo.name || '-'}
          </Text>

          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={{color: COLORS.TEXT_INPUT}}
            testID="tokenFingerprintText"
          >
            {isPrimary ? '' : tokenInfo.fingerprint}
          </Text>
        </View>

        <View style={{flex: 1, alignItems: 'flex-end', padding: 4}} testID="tokenAmountText">
          <Text style={{color: COLORS.DARK_TEXT}}>
            {formatTokenAmount(new BigNumber(quantity), toToken({wallet, tokenInfo}))}
          </Text>
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

const matches = (tokenInfo: TokenInfo, matcher: string) =>
  Object.keys(tokenInfo).some((key) => normalize(key).includes(matcher))

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
