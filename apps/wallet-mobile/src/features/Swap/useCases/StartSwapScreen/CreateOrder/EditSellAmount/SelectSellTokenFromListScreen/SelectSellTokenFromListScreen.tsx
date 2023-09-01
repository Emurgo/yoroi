import {FlashList} from '@shopify/flash-list'
import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Spacer, Text} from '../../../../../../../components'
import {AmountItem} from '../../../../../../../components/AmountItem/AmountItem'
import {useMetrics} from '../../../../../../../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../../theme'
import {sortTokenInfos} from '../../../../../../../utils'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useBalance, useIsWalletEmpty} from '../../../../../../../yoroi-wallets/hooks'
import {filterByFungibility} from '../../../../../../Send/common/filterByFungibility'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {Counter} from '../../../../../common/Counter/Counter'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'
import {useSwapTouched} from '../../TouchedContext'

export const SelectSellTokenFromListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapFrom,
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subheader}></View>

      <View style={styles.labels}>
        <Text style={styles.label}>{strings.asset}</Text>

        <Text style={styles.label}>{strings.balance}</Text>
      </View>

      <Spacer height={16} />

      <View style={styles.line} />

      <Boundary>
        <TokenList />
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const filteredTokenInfos = useFilteredTokenInfos({tokenInfos})

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenInfos}
        renderItem={({item: tokenInfo}: {item: Balance.TokenInfo}) => (
          <Boundary>
            <SelectableToken
              tokenInfo={tokenInfo}
              disabled={tokenInfo.id !== wallet.primaryTokenInfo.id}
              wallet={wallet}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({id}) => id}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={<EmptyList filteredTokenInfos={filteredTokenInfos} allTokenInfos={tokenInfos} />}
      />

      <Counter counter={filteredTokenInfos.length} />
    </View>
  )
}

type SelectableTokenProps = {disabled?: boolean; tokenInfo: Balance.TokenInfo; wallet: YoroiWallet}
const SelectableToken = ({tokenInfo, wallet}: SelectableTokenProps) => {
  const {closeSearch} = useSearch()
  const {sellAmountChanged, createOrder} = useSwap()
  const {sellTouched} = useSwapTouched()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const balanceAvailable = useBalance({wallet, tokenId: tokenInfo.id})
  // use case if the user has changed the current selected token to sell it's updated to 0
  const quantity = createOrder.amounts.sell.tokenId === tokenInfo.id ? createOrder.amounts.sell.quantity : '0'

  const onSelect = () => {
    track.swapAssetFromChanged({
      from_asset: [{asset_name: tokenInfo.name, asset_ticker: tokenInfo.ticker, policy_id: tokenInfo.group}],
    })
    sellTouched()
    sellAmountChanged({tokenId: tokenInfo.id, quantity})
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity style={[styles.item]} onPress={onSelect} testID="selectTokenButton">
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: balanceAvailable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const useFilteredTokenInfos = ({tokenInfos}: {tokenInfos: Array<Balance.TokenInfo>}) => {
  const wallet = useSelectedWallet()

  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const isWalletEmpty = useIsWalletEmpty(wallet)
  if (isWalletEmpty && !isSearching && tokenInfos?.length === 0) return []

  const filteredTokenInfos = tokenInfos.filter(filterBySearch(assetSearchTerm)).filter(
    filterByFungibility({
      fungibilityFilter: 'ft',
    }),
  )

  return sortTokenInfos({
    wallet,
    tokenInfos: filteredTokenInfos,
  })
}

const EmptyList = ({
  filteredTokenInfos,
  allTokenInfos,
}: {
  filteredTokenInfos: Array<Balance.TokenInfo>
  allTokenInfos: Array<Balance.TokenInfo>
}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if ((isSearching && assetSearchTerm.length > 0 && filteredTokenInfos.length === 0) || allTokenInfos.length === 0)
    return <EmptySearchResult />

  return null
}

const EmptySearchResult = () => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={50} />

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssetsFound}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Rubik',
    fontSize: 12,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 18,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  subheader: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 14,
  },
  line: {
    height: 1,
    backgroundColor: COLORS.BORDER_GRAY,
  },
  list: {
    flex: 1,
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    textAlign: 'center',
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 20,
    color: '#000',
    paddingTop: 4,
  },
})
