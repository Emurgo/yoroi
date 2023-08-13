import {FlashList} from '@shopify/flash-list'
import {useSwap} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Spacer, Text} from '../../../../../../../components'
import {AmountItem} from '../../../../../../../components/AmountItem/AmountItem'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../../theme'
import {sortTokenInfos} from '../../../../../../../utils'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useBalance, useIsWalletEmpty} from '../../../../../../../yoroi-wallets/hooks'
import {filterByFungibility} from '../../../../../../Send/common/filterByFungibility'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'

export const SelectSellTokenFromListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapFrom,
  })

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subheader}></View>

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
  // const pairTokens = useFilterTokensByPair()

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
        contentContainerStyle={styles.assetListContent}
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
  const {sellAmountChanged} = useSwap()
  const navigateTo = useNavigateTo()
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const balanceAvailable = useBalance({wallet, tokenId: tokenInfo.id})

  const onSelect = () => {
    sellAmountChanged({tokenId: tokenInfo.id, quantity: balanceAvailable})
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
    >
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: balanceAvailable}} wallet={wallet} />
    </TouchableOpacity>
  )
}

const Counter = ({counter}: {counter: number}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()

  if (!isSearching) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.tokens(counter)}`}</Text>
      </View>
    )
  }

  if (isSearching && assetSearchTerm.length > 0) {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterTextBold}>{`${counter} ${strings.assets(counter)} `}</Text>

        <Text style={styles.counterText}>{strings.found}</Text>
      </View>
    )
  }

  return null
}

// will add this once we mock the request for testnet
// const useFilterTokensByPair = () => {
//   const {pairsByToken} = usePairListByToken(
//     '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61.446a65644d6963726f555344',
//   )
//   return pairsByToken
// }

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
  container: {
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
  counter: {
    padding: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  counterText: {
    fontWeight: '400',
    color: COLORS.SHELLEY_BLUE,
  },
  counterTextBold: {
    fontWeight: 'bold',
    color: COLORS.SHELLEY_BLUE,
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
