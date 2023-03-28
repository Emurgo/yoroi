import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {LayoutAnimation, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AssetItem} from '../../../../../components/AssetItem'
import globalMessages, {txLabels} from '../../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {maxTokensPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {useSelectedTokensCounter, useTokenQuantities} from '../../../common/hooks'
import {useSend} from '../../../common/SendContext'
import {InputSearch} from './InputSearch'
import {MaxTokensPerTx} from './ShowError/MaxTokensPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)
  const [matcher, setMatcher] = React.useState('')

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const sortedTokenInfos = sortTokenInfos({wallet, tokenInfos}).filter((tokenInfo) => matches(tokenInfo, matcher))
  const selectedTokensCounter = useSelectedTokensCounter()
  const canAddToken = selectedTokensCounter < maxTokensPerTx

  const onChangeMatcher = (matcher: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMatcher(matcher)
  }

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
        <InputSearch onChangeText={(text) => onChangeMatcher(text)} autoComplete />

        {!canAddToken && (
          <View>
            <MaxTokensPerTx />

            <Spacer height={16} />
          </View>
        )}

        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: COLORS.GREY_6}}>{strings.assetsLabel}</Text>

          <Text style={{color: COLORS.GREY_6}}>{strings.amount}</Text>
        </View>

        <Spacer height={16} />

        <HR />
      </View>

      <FlashList
        data={sortedTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem tokenInfo={tokenInfo} disabled={!canAddToken} wallet={wallet} />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
      />
    </View>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)

    // if the balance is atomic there is no need to edit the amount
    if (Quantities.isAtomic(spendable, tokenInfo.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-selected-tokens')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="assetSelectorItem" disabled={disabled}>
      <AssetItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
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
