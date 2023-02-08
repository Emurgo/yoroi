import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Spacer, Text} from '../../../../components'
import {AssetItem, AssetItemProps} from '../../../../components/AssetItem'
import globalMessages, {txLabels} from '../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../navigation'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {sortTokenInfos} from '../../../../utils'
import {useBalances, useTokenInfos} from '../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils'
import {useTokenQuantities} from '../../../shared/hooks'
import {useSend} from '../../../shared/SendContext'
import {InputSearch} from './InputSearch'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)
  const [matcher, setMatcher] = React.useState('')

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
        <InputSearch onChangeText={(text) => onChangeMatcher(text)} autoComplete />

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
            <SelectableAssetItem tokenInfo={tokenInfo} />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
      />
    </SafeAreaView>
  )
}

type SelectableAssetItemProps = Omit<AssetItemProps, 'quantity'>
const SelectableAssetItem = ({tokenInfo}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)

    // if the token is indivisible, we don't need to ask for the amount
    if (Quantities.isIndivisible(spendable, tokenInfo.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-selected-tokens')
    } else {
      navigation.navigate('send-edit-token-amount')
    }
  }

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="assetSelectorItem">
      <AssetItem tokenInfo={tokenInfo} quantity={spendable} />
    </TouchableOpacity>
  )
}

const HR = (props) => <View {...props} style={{height: 1, backgroundColor: COLORS.GRAY}} />

const matches = (tokenInfo: TokenInfo, matcher: string) =>
  Object.values(tokenInfo)
    .filter((value): value is string | number => value != null)
    .some((value) => normalize(value).includes(normalize(matcher)))

const normalize = (text: string | number) => String(text).trim().toLocaleLowerCase()

const useStrings = () => {
  const intl = useIntl()

  return {
    unknownAsset: intl.formatMessage(messages.unknownAsset),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
    amount: intl.formatMessage(txLabels.amount),
  }
}

const messages = defineMessages({
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
})
