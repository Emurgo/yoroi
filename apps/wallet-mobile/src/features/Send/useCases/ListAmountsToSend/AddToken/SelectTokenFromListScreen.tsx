import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Boundary, Spacer, Text} from '../../../../../components'
import {AmountItem} from '../../../../../components/AmountItem/AmountItem'
import {NftImageGallery} from '../../../../../components/NftImageGallery'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useAllTokenInfos, useBalances, useIsWalletEmpty, useNfts} from '../../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../../../WalletManager/Context'
import {filterByFungibility} from '../../../common/filterByFungibility'
import {filterBySearch} from '../../../common/filterBySearch'
import {useOverridePreviousSendTxRoute} from '../../../common/navigation'
import {NoAssetFoundImage} from '../../../common/NoAssetFoundImage'
import {useStrings} from '../../../common/strings'
import {useSelectedSecondaryAmountsCounter} from '../../../common/useSelectedSecondaryAmountsCounter'
import {useTokenQuantities} from '../../../common/useTokenQuantities'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export type FungibilityFilter = 'all' | 'ft' | 'nft'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const [fungibilityFilter, setFungibilityFilter] = React.useState<FungibilityFilter>('all')
  const {targets, selectedTargetIndex} = useTransfer()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.sendSelectAssetPageViewed()
    }, [track]),
  )

  const {amounts} = targets[selectedTargetIndex].entry
  const hasTokensSelected = Object.keys(amounts).length > 0

  useOverridePreviousSendTxRoute(hasTokensSelected ? 'send-list-amounts-to-send' : 'send-start-tx')

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
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {tokenSelectedChanged, amountChanged, targets, selectedTargetIndex} = useTransfer()
  const {closeSearch} = useSearch()
  const balances = useBalances(wallet)
  const strings = useStrings()
  const {nfts} = useNfts(wallet)
  const amountsSelected = Object.keys(targets[selectedTargetIndex].entry.amounts)
  const filteredAndSorted = nfts.filter(filterOutSelected(amountsSelected)).sort((a, b) => sortNfts(a.name, b.name))
  const counter = filteredAndSorted.length

  const onSelect = (nftId: string) => {
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
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const filteredTokenInfos = useFilteredTokenInfos({fungibilityFilter, tokenInfos})

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenInfos}
        renderItem={({item: tokenInfo}: {item: Balance.TokenInfo}) => (
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
  const {styles} = useStyles()
  return <View style={styles.tabs}>{children}</View>
}

type TabProps = {
  onPress: (active: FungibilityFilter) => void
  active: FungibilityFilter
  tab: FungibilityFilter
  label: string
}
const Tab = ({onPress, active, tab, label}: TabProps) => {
  const {styles, colors} = useStyles()
  return (
    <TouchableOpacity
      onPress={() => onPress(tab)}
      style={[styles.tabContainer, active === tab && styles.tabContainerActive]}
    >
      <Text
        style={[
          styles.tab,
          {
            color: active === tab ? colors.activeTab : colors.inactiveTab,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: Balance.TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, disabled, wallet}: SelectableAssetItemProps) => {
  const {styles} = useStyles()
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged, amountChanged} = useTransfer()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const balances = useBalances(wallet)

  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const onSelect = () => {
    tokenSelectedChanged(tokenInfo.id)
    closeSearch()

    // if the balance is atomic there is no need to edit the amount
    if (tokenInfo.kind === 'ft' && Quantities.isAtomic(spendable, tokenInfo.decimals ?? 0)) {
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
  filteredTokenInfos: Array<Balance.TokenInfo>
  allTokenInfos: Array<Balance.TokenInfo>
}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const wallet = useSelectedWallet()
  const {targets, selectedTargetIndex} = useTransfer()
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
  const {styles} = useStyles()
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
  const {styles} = useStyles()
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
  const {styles} = useStyles()

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
  tokenInfos: Array<Balance.TokenInfo>
}) => {
  const wallet = useSelectedWallet()
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const {targets, selectedTargetIndex} = useTransfer()
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

const areAllTokensSelected = (selectedTokenIds: Array<string>, tokenInfos: Balance.TokenInfo[]): boolean =>
  tokenInfos.every((tokenInfo) => selectedTokenIds.includes(tokenInfo.id))
const filterOutSelected = (selectedTokenIds: Array<string>) => (token: Balance.TokenInfo) =>
  !selectedTokenIds.includes(token.id)
const sortNfts = (nftNameA: string, nftNameB: string): number => nftNameA.localeCompare(nftNameB)

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    subheader: {
      ...atoms.px_lg,
    },
    item: {
      ...atoms.py_md,
    },
    borderBottom: {
      borderBottomColor: color.gray_c200,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    panel: {
      ...atoms.px_lg,
    },
    tabs: {
      flexDirection: 'row',
    },
    tabContainer: {
      flex: 1,
    },
    tabContainerActive: {
      borderBottomColor: color.primary_c600,
      borderBottomWidth: 2,
    },
    tab: {
      textAlign: 'center',
      ...atoms.py_md,
      ...atoms.body_1_lg_medium,
    },
    list: {
      flex: 1,
    },
    assetListContent: {
      ...atoms.px_lg,
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
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
      flex: 1,
      textAlign: 'center',
    },
    counter: {
      ...atoms.p_lg,
      justifyContent: 'center',
      flexDirection: 'row',
    },
    counterText: {
      color: color.primary_c600,
      ...atoms.body_2_md_regular,
    },
    counterTextBold: {
      color: color.primary_c600,
      ...atoms.body_2_md_medium,
    },
  })

  const colors = {
    activeTab: color.primary_c600,
    inactiveTab: color.gray_c600,
  }

  return {styles, colors}
}
