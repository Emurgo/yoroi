export type FungibilityFilter = 'all' | 'ft' | 'nft'
import {FlashList} from '@shopify/flash-list'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Boundary} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {useSearch, useSearchOnNavBar} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos} from '../../../../yoroi-wallets/hooks'
import {useSend, useTokenQuantities} from '../../../Send/common/SendContext'
import {useStrings} from '../../common/strings'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  return (
    <View style={styles.root}>
      <View style={styles.subheader}></View>

      <List />
    </View>
  )
}

const List = () => {
  return <AssetList />
}

const AssetList = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})

  return (
    <View style={styles.list}>
      <FlashList
        data={tokenInfos}
        renderItem={({item: tokenInfo}: {item: Balance.TokenInfo}) => (
          <Boundary>
            <SelectableAssetItem
              tokenInfo={tokenInfo}
              disabled={tokenInfo.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        contentContainerStyle={styles.assetListContent}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        // ListEmptyComponent={<ListEmptyComponent filteredTokenInfos={filteredTokenInfos} allTokenInfos={tokenInfos} />}
      />

      {/* <Counter fungibilityFilter={fungibilityFilter} counter={filteredTokenInfos.length} /> */}
    </View>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: Balance.TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged} = useSend() // TODO CHANGE THIS
  const {spendable} = useTokenQuantities(tokenInfo.id)
  // const navigation = useNavigation<SwapTokenRouteseNavigation>()
  // const balances = useBalances(wallet)

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)
    console.log('tokenSelectedChanged', tokenInfo.id)
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
      disabled={disabled}
    >
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'white',
  },
  subheader: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 14,
  },
  borderBottom: {
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  list: {
    flex: 1,
  },
  assetListContent: {
    paddingHorizontal: 16,
  },
})
