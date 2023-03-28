import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {AssetItem, AssetItemProps} from '../../../../../components/AssetItem'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch} from '../../../../../Search'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {sortTokenInfos} from '../../../../../utils'
import {useBalances, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {useTokenQuantities} from '../../../common/hooks'
import {useSend} from '../../../common/SendContext'
import {filterAssets} from './filterAssets'

export const SelectTokenFromListScreen = () => {
  const wallet = useSelectedWallet()

  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  const {search: assetSearchTerm} = useSearch()
  const assets = sortTokenInfos({wallet, tokenInfos: filterAssets(assetSearchTerm, tokenInfos)})

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
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
    </View>
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
      navigation.navigate('send-list-selected-tokens')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }

  return (
    <TouchableOpacity style={{paddingVertical: 16}} onPress={onSelect} testID="assetSelectorItem">
      <AssetItem tokenInfo={tokenInfo} quantity={spendable} />
    </TouchableOpacity>
  )
}
