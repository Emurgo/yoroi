import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import globalMessages, {txLabels} from '../../../../../i18n/global-messages'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {maxTokensPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {useSelectedTokensCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {filterAssets} from './filterAssets'
import {MaxTokensPerTx} from './ShowError/MaxTokensPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const selectedTokensCounter = useSelectedTokensCounter()
  const canAddToken = selectedTokensCounter < maxTokensPerTx

  const {search: assetSearchTerm} = useSearch()
  const assets = sortTokenInfos({wallet, tokenInfos: filterAssets(assetSearchTerm, tokenInfos)})

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{paddingTop: 16, paddingHorizontal: 16}}>
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
        data={assets}
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
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="selectTokenButton" disabled={disabled}>
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const HR = (props) => <View {...props} style={{height: 1, backgroundColor: COLORS.GRAY}} />

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
