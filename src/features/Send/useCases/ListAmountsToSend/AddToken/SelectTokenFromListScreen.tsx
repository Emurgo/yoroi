import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterAssets} from '../../../common/filterAssets'
import {useSelectedSecondaryAmountsCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {EmptySearchResult} from './Show/EmptySearchResult'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()

  // use case: search listed tokens
  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })
  const secondaryAmountsCounter = useSelectedSecondaryAmountsCounter(wallet)
  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx

  const {search: assetSearchTerm} = useSearch()
  const sortedTokenInfos = sortTokenInfos({wallet, tokenInfos: filterAssets(assetSearchTerm, tokenInfos)})
  const isSearchResultEmpty = assetSearchTerm.length > 0 && sortedTokenInfos.length === 0

  return (
    <View style={styles.root}>
      {!canAddAmount && (
        <View style={styles.panel}>
          <MaxAmountsPerTx />

          <Spacer height={16} />
        </View>
      )}

      <FlashList
        data={sortedTokenInfos}
        renderItem={({item: tokenInfo}: {item: TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem
              tokenInfo={tokenInfo}
              disabled={!canAddAmount && tokenInfo.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={{paddingHorizontal: 16}}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={isSearchResultEmpty ? <EmptySearchResult /> : undefined}
      />

      <View style={styles.counter}>
        <Text style={styles.counterText1}>{strings.counter1(sortedTokenInfos.length)}</Text>

        <Text style={styles.counterText2}>{` ${strings.counter2}`}</Text>
      </View>
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
    if (tokenInfo.kind === 'ft' && Quantities.isAtomic(spendable, tokenInfo.metadata.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-amounts-to-send')
    }
    if (tokenInfo.kind === 'nft') {
      amountChanged('1')
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={styles.item} onPress={onSelect} testID="selectTokenButton" disabled={disabled}>
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  counter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  counterText1: {
    fontWeight: 'bold',
    color: '#3154CB',
  },
  counterText2: {
    fontWeight: '400',
    color: '#3154CB',
  },
  item: {
    paddingVertical: 16,
  },
  panel: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
})
