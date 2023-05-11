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
import {COLORS} from '../../../../../theme'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useAllTokenInfos, useBalances, useIsWalletEmpty, useNfts} from '../../../../../yoroi-wallets/hooks'
import {TokenInfo} from '../../../../../yoroi-wallets/types'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {filterByFungibility} from '../../../common/filterByFungibility'
import {filterBySearch} from '../../../common/filterBySearch'
import {NoAssetFoundImage} from '../../../common/NoAssetFoundImage'
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
  const showNftList = fungibilityFilter === 'nft' && !isSearching

  if (showNftList) return <NftList canAddAmount={canAddAmount} />

  return <AssetList fungibilityFilter={fungibilityFilter} canAddAmount={canAddAmount} />
}

const NftList = ({canAddAmount}: {canAddAmount: boolean}) => {
  const wallet = useSelectedWallet()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {tokenSelectedChanged, amountChanged, targets, selectedTargetIndex} = useSend()
  const {closeSearch} = useSearch()
  const balances = useBalances(wallet)
  const strings = useStrings()
  const {nfts} = useNfts(wallet)
  const amountsSelected = Object.keys(targets[selectedTargetIndex].entry.amounts)
  const filteredAndSorted = nfts
    .filter(filterOutSelected(amountsSelected))
    .sort((a, b) => sortNfts(a.name ?? '', b.name ?? ''))
  const counter = filteredAndSorted.length

  const onSelect = (nftId) => {
    tokenSelectedChanged(nftId)
    closeSearch()

    const quantity = Amounts.getAmount(balances, nftId).quantity
    amountChanged(quantity)
    navigation.navigate('send-list-amounts-to-send')
  }

  return (
    <View style={styles.list}>
      <NftImageGallery
        nfts={filteredAndSorted}
        onRefresh={() => undefined}
        onSelect={onSelect}
        readOnly={!canAddAmount}
        isRefreshing={false}
        withVerticalPadding={filteredAndSorted.length > 0} // to keep consistency between tabs when the list is not empty
        ListEmptyComponent={
          filteredAndSorted.length === 0 ? <NoAssetsYet text={strings.noAssetsAddedYet(strings.nfts(2))} /> : null
        }
      />

      <Counter fungibilityFilter="nft" counter={counter} />
    </View>
  )
}

type AssetListProps = {
  canAddAmount: boolean
  fungibilityFilter: FungibilityFilter
}
const AssetList = ({canAddAmount, fungibilityFilter}: AssetListProps) => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const filteredTokenInfos = useFilteredTokenInfos({fungibilityFilter, tokenInfos})

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenInfos}
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
        ListEmptyComponent={<ListEmptyComponent filteredTokenInfos={filteredTokenInfos} allTokenInfos={tokenInfos} />}
      />

      <Counter fungibilityFilter={fungibilityFilter} counter={filteredTokenInfos.length} />
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
          color: active === tab ? COLORS.SHELLEY_BLUE : COLORS.TEXT_INPUT,
        },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
)

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged, amountChanged} = useSend()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const balances = useBalances(wallet)

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)
    closeSearch()

    // if the balance is atomic there is no need to edit the amount
    if (tokenInfo.kind === 'ft' && Quantities.isAtomic(spendable, tokenInfo.metadata.decimals)) {
      amountChanged(spendable)
      navigation.navigate('send-list-amounts-to-send')
    } else if (tokenInfo.kind === 'nft') {
      const quantity = Amounts.getAmount(balances, tokenInfo.id).quantity
      amountChanged(quantity)
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

const ListEmptyComponent = ({
  filteredTokenInfos,
  allTokenInfos,
}: {
  filteredTokenInfos: Array<TokenInfo>
  allTokenInfos: Array<TokenInfo>
}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useSend()
  const selectedTokenIds = Object.keys(targets[selectedTargetIndex].entry.amounts)
  const isSelectTokenFromListEmpty = areAllTokensSelected(selectedTokenIds, allTokenInfos)
  const strings = useStrings()
  const isWalletEmpty = useIsWalletEmpty(wallet)

  if (isSearching && assetSearchTerm.length > 0 && filteredTokenInfos.length === 0) return <EmptySearchResult />

  if ((isWalletEmpty || isSelectTokenFromListEmpty) && !isSearching)
    return <NoAssetsYet text={strings.noAssetsAddedYet(strings.tokens(2))} />

  return null
}

const NoAssetsYet = ({text}: {text: string}) => {
  return (
    <View style={styles.imageContainer}>
      <Spacer height={160} />

      <NoAssetFoundImage style={styles.image} />

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

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{strings.noAssets}</Text>
    </View>
  )
}

const Counter = ({fungibilityFilter, counter}: {fungibilityFilter: FungibilityFilter; counter: number}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const strings = useStrings()

  if (!isSearching && fungibilityFilter === 'all') {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.assets(counter)}`}</Text>
      </View>
    )
  }

  if (!isSearching && fungibilityFilter === 'ft') {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.tokens(counter)}`}</Text>
      </View>
    )
  }

  if (!isSearching && fungibilityFilter === 'nft') {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.nfts(counter)}`}</Text>
      </View>
    )
  }

  // if it is searching and typing the counter is shown
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

// filteredTokenInfos has primary token when the search term and the wallet are empty and the ft/all tab is selected
const useFilteredTokenInfos = ({
  fungibilityFilter,
  tokenInfos,
}: {
  fungibilityFilter: FungibilityFilter
  tokenInfos: Array<TokenInfo>
}) => {
  const wallet = useSelectedWallet()
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const {targets, selectedTargetIndex} = useSend()
  const isWalletEmpty = useIsWalletEmpty(wallet)

  /*
   * to show the empty list component:
   *    - filteredTokenInfos has primary token when the search term and the wallet are empty and the ft or all tab are selected
   *    - "ft" tab has to have primary token hidden when wallet is empty and to show the empty list component
   *    - "all" tab has to display the primary token and not to show the empty list component
   */
  if (fungibilityFilter === 'ft' && isWalletEmpty && !isSearching) return []

  const selectedTokenIds = Object.keys(targets[selectedTargetIndex].entry.amounts)

  const filteredTokenInfos = tokenInfos
    .filter(filterOutSelected(selectedTokenIds))
    .filter(filterBySearch(assetSearchTerm))
    .filter(
      filterByFungibility({
        fungibilityFilter: isSearching ? 'all' : fungibilityFilter, // all assets must be available when searching
      }),
    )

  return sortTokenInfos({
    wallet,
    tokenInfos: filteredTokenInfos,
  })
}

const areAllTokensSelected = (selectedTokenIds: Array<string>, tokenInfos): boolean =>
  tokenInfos.every((tokenInfo) => selectedTokenIds.includes(tokenInfo.id))
const filterOutSelected = (selectedTokenIds: Array<string>) => (token: TokenInfo) =>
  !selectedTokenIds.includes(token.id)
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
    borderBottomColor: COLORS.BORDER_GRAY,
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
    borderBottomColor: COLORS.SHELLEY_BLUE,
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
    color: COLORS.SHELLEY_BLUE,
  },
  counterTextBold: {
    fontWeight: 'bold',
    color: COLORS.SHELLEY_BLUE,
  },
})
