import {useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {NftImageGallery} from '../../../../../components/NftImageGallery'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet/Context/SelectedWalletContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useNfts, useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo, YoroiNft} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterByFungibility} from '../../../common/filterByFungibility'
import {filterBySearch} from '../../../common/filterBySearch'
import {NoAssetFounfImage} from '../../../common/NoAssetFoundImage'
import {useSelectedSecondaryAmountsCounter, useSend, useTokenQuantities} from '../../../common/SendContext'
import {useStrings} from '../../../common/strings'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export type FungibilityFilter = 'all' | 'ft' | 'nft'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const [fungibilityFilter, setFungibilityFilter] = React.useState<FungibilityFilter>('all')

  // use case: search listed tokens
  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  const wallet = useSelectedWallet()

  const secondaryAmountsCounter = useSelectedSecondaryAmountsCounter(wallet)

  const {visible: isSearching} = useSearch()

  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx

  return (
    <View style={styles.root}>
      <View style={styles.subheader}>
        {!isSearching && (
          <Tabs>
            <Tab active={fungibilityFilter} onPress={setFungibilityFilter} label={strings.all} tab="all" />

            <Tab active={fungibilityFilter} onPress={setFungibilityFilter} label={strings.tokens(2)} tab="ft" />

            <Tab active={fungibilityFilter} onPress={setFungibilityFilter} label={strings.nfts(2)} tab="nft" />
          </Tabs>
        )}

        {!canAddAmount && (
          <View style={styles.panel}>
            <MaxAmountsPerTx />

            <Spacer height={16} />
          </View>
        )}
      </View>

      <List fungibilityFilter={fungibilityFilter} isSearching={isSearching} canAddAmount={canAddAmount} />
    </View>
  )
}

type ListProps = {
  fungibilityFilter: FungibilityFilter
  isSearching: boolean
  canAddAmount: boolean
}

const List = ({fungibilityFilter, isSearching, canAddAmount}: ListProps) => {
  const isNftListVisible = fungibilityFilter === 'nft' && !isSearching

  if (isNftListVisible) return <NftList />
  return <AssetList fungibilityFilter={fungibilityFilter} canAddAmount={canAddAmount} />
}

const NftList = () => {
  const wallet = useSelectedWallet()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {tokenSelectedChanged, amountChanged, targets, selectedTargetIndex} = useSend()
  const balances = useBalances(wallet)

  const {nfts} = useNfts(wallet)
  const selectedAddresses = Object.keys(targets[selectedTargetIndex].entry.amounts)
  const filtered = nfts.filter(filterBySelection(selectedAddresses))
  const sortedNfts = filtered.sort((NftA, NftB) => sortNfts(NftA.name, NftB.name))

  const onSelect = (nftId) => {
    tokenSelectedChanged(nftId)

    const quantity = Amounts.getAmount(balances, nftId).quantity
    amountChanged(quantity)
    navigation.navigate('send-list-amounts-to-send')
  }

  return (
    <View style={styles.list}>
      <NftImageGallery
        nfts={sortedNfts}
        onRefresh={() => undefined}
        onSelect={onSelect}
        isRefreshing={false}
        withVerticalPadding={nfts.length > 0} // to keep consistency between tabs when the list is not empty
        ListEmptyComponent={<ListEmptyComponent fungibilityFilter="nft" />}
      />

      <Counter fungibilityFilter="nft" />
    </View>
  )
}

type AssetListProps = {
  canAddAmount: boolean
  fungibilityFilter: FungibilityFilter
}

const AssetList = ({canAddAmount, fungibilityFilter}: AssetListProps) => {
  const wallet = useSelectedWallet()
  const filteredTokenInfos = useFilteredTokenInfos({fungibilityFilter})
  const isWalletEmpty = useIsWalletEmpty()
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  /*
   * to show the empty list component:
   *    - filteredTokenInfos has primary token when the search term and the wallet are empty and the ft oot all tab are selected
   *    - "ft" tab has to have primary token hidden when wallet is empty and to show the empty list component
   *    - "all" tab has to display the primary token and not to show the empty list component
   */
  const data =
    fungibilityFilter === 'ft' && isWalletEmpty && assetSearchTerm.length === 0 && !isSearching
      ? []
      : filteredTokenInfos

  return (
    <View style={styles.list}>
      <FlashList
        data={data}
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
        contentContainerStyle={styles.assetListContent}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
        ListEmptyComponent={<ListEmptyComponent fungibilityFilter={fungibilityFilter} />}
      />

      <Counter fungibilityFilter={fungibilityFilter} />
    </View>
  )
}

const Tabs = ({children}: {children: React.ReactNode}) => {
  return <View style={styles.tabs}>{children}</View>
}

type TabProps = {
  onPress: (active: FungibilityFilter) => void
  active: FungibilityFilter
  tab: FungibilityFilter
  label: string
}

const Tab = ({onPress, active, tab, label}: TabProps) => (
  <TouchableOpacity
    onPress={() => onPress(tab)}
    style={[styles.tabContainer, active === tab && styles.tabContainerActive]}
  >
    <Text
      style={[
        styles.tab,
        {
          color: active === tab ? '#3154CB' : '#6B7384',
        },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

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

const ListEmptyComponent = ({fungibilityFilter}: {fungibilityFilter: FungibilityFilter}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const filteredTokenInfos = useFilteredTokenInfos({fungibilityFilter})
  const strings = useStrings()

  const isWalletEmpty = useIsWalletEmpty()

  if (isSearching && assetSearchTerm.length > 0 && filteredTokenInfos.length === 0) return <EmptySearchResult />

  if (fungibilityFilter === 'ft' && isWalletEmpty && !isSearching)
    return <NoAssetsYet text={strings.noAssetsAddedYet(strings.tokens(2))} />

  if (fungibilityFilter === 'nft' && nfts.length === 0)
    return <NoAssetsYet text={strings.noAssetsAddedYet(strings.nfts(2))} />

  return null
}

const NoAssetsYet = ({text}: {text: string}) => {
  return (
    <View style={styles.imageContainer}>
      <Spacer height={160} />

      <NoAssetFounfImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{text}</Text>
    </View>
  )
}

const EmptySearchResult = () => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={160} />

      <NoAssetFounfImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssets}</Text>
    </View>
  )
}

const Counter = ({fungibilityFilter}: {fungibilityFilter: FungibilityFilter}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const filteredTokenInfos = useFilteredTokenInfos({fungibilityFilter})
  const {nfts} = useNfts(wallet)

  if (!isSearching && fungibilityFilter === 'all') {
    const total = filteredTokenInfos.length

    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${total} ${strings.assets(total)}`}</Text>
      </View>
    )
  }

  if (!isSearching && fungibilityFilter === 'ft') {
    const total = filteredTokenInfos.length

    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${total} ${strings.tokens(total)}`}</Text>
      </View>
    )
  }

  if (!isSearching && fungibilityFilter === 'nft') {
    const total = nfts.length

    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${total} ${strings.nfts(total)}`}</Text>
      </View>
    )
  }

  // if it is searching and typing the counter is shown
  if (isSearching && assetSearchTerm.length > 0) {
    const total = filteredTokenInfos.length

    return (
      <View style={styles.counter}>
        <Text style={styles.counterTextBold}>{`${total} ${strings.assets(total)} `}</Text>

        <Text style={styles.counterText}>{strings.found}</Text>
      </View>
    )
  }

  return null
}

const useIsWalletEmpty = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  return (
    tokenInfos.length === 1 &&
    tokenInfos[0].id === wallet.primaryTokenInfo.id &&
    Amounts.getAmount(balances, wallet.primaryTokenInfo.id).quantity === Quantities.zero
  )
}

// filteredTokenInfos has primary token when the search term and the wallet are empty and the ft/all tab is selected
const useFilteredTokenInfos = ({fungibilityFilter}: {fungibilityFilter: FungibilityFilter}) => {
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const balances = useBalances(wallet)
  const {targets, selectedTargetIndex} = useSend()

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: Amounts.toArray(balances).map(({tokenId}) => tokenId),
  })

  const selectedAddresses = Object.keys(targets[selectedTargetIndex].entry.amounts)
  const filteredBySelection = tokenInfos.filter(filterBySelection(selectedAddresses))

  const filteredBySearch = filteredBySelection.filter(filterBySearch(assetSearchTerm))

  const filteredByFungibility = filteredBySearch.filter(
    filterByFungibility({
      nfts,
      fungibilityFilter: isSearching ? 'all' : fungibilityFilter, // all assets must be available when searching
    }),
  )

  return sortTokenInfos({
    wallet,
    tokenInfos: filteredByFungibility,
  })
}

const filterBySelection = (selectedAddresses: Array<string>) => (target: YoroiNft | TokenInfo) =>
  selectedAddresses.includes(target.id) !== true

const sortNfts = (nftNameA: string, nftNameB: string): number => nftNameA.localeCompare(nftNameB)

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
    borderBottomColor: '#DCE0E9',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panel: {
    paddingTop: 16,
  },
  tabs: {
    flexDirection: 'row',
  },
  tabContainer: {
    flex: 1,
  },
  tabContainerActive: {
    borderBottomColor: '#3154CB',
    borderBottomWidth: 2,
  },
  tab: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 12,
  },
  list: {
    flex: 1,
  },
  assetListContent: {
    paddingHorizontal: 16,
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
    fontWeight: 'bold',
    fontSize: 20,
    color: '#000',
  },
  counter: {
    padding: 16,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  counterText: {
    fontWeight: '400',
    color: '#3154CB',
  },
  counterTextBold: {
    fontWeight: 'bold',
    color: '#3154CB',
  },
})
