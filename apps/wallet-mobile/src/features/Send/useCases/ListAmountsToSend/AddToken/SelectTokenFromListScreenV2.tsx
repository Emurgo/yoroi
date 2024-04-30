import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {targetGetTokenBalanceBreakdown, useTransfer} from '@yoroi/transfer'
import {Balance, Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer, Text} from '../../../../../components'
import {NftImageGallery} from '../../../../../components/NftImageGallery'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {sortTokenInfos} from '../../../../../utils'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useBalances, useIsWalletEmpty, useNfts} from '../../../../../yoroi-wallets/hooks'
import {Amounts} from '../../../../../yoroi-wallets/utils'
import {usePortfolioBalances} from '../../../../Portfolio/common/hooks/usePortfolioBalances'
import {usePortfolioPrimaryBreakdown} from '../../../../Portfolio/common/hooks/usePortfolioPrimaryBreakdown'
import {useSelectedWallet} from '../../../../WalletManager/Context'
import {filterByFungibility} from '../../../common/filterByFungibility'
import {filterBySearch} from '../../../common/filterBySearch'
import {useOverridePreviousSendTxRoute} from '../../../common/navigation'
import {NoAssetFoundImage} from '../../../common/NoAssetFoundImage'
import {useStrings} from '../../../common/strings'
import {useSelectedSecondaryAmountsCounter} from '../../../common/useSelectedSecondaryAmountsCounter'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {targets, selectedTargetIndex} = useTransfer()

  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const [fungibilityFilter, setFungibilityFilter] = React.useState<Exclude<keyof typeof balances, 'records'>>('all')
  const [isPending, startTransition] = React.useTransition()
  const showOnlyNfts = fungibilityFilter === 'nfts'
  const filteredBalancesByFungibility = balances[fungibilityFilter]
  const withoutSelected = React.useMemo(
    () => filteredBalancesByFungibility.filter(filterOutSelected(targets[selectedTargetIndex].entry.amounts)),
    [filteredBalancesByFungibility, selectedTargetIndex, targets],
  )
  const balancesBreakdown = 

  const counter = withoutSelected.length

  const {track} = useMetrics()
  useFocusEffect(
    React.useCallback(() => {
      track.sendSelectAssetPageViewed()
    }, [track]),
  )

  // to redirect the user automatically there is no amount added
  const {amounts} = targets[selectedTargetIndex].entry
  const hasTokensSelected = Object.keys(amounts).length > 0
  useOverridePreviousSendTxRoute(hasTokensSelected ? 'send-list-amounts-to-send' : 'send-start-tx')

  const {visible: isSearching} = useSearch()
  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })

  const secondaryAmountsCounter = useSelectedSecondaryAmountsCounter(wallet)

  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx

  const handleOnPressNFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('nfts')), [])
  const handleOnPressFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('fts')), [])
  const handleOnPressAll = React.useCallback(() => startTransition(() => setFungibilityFilter('all')), [])

  return (
    <View style={styles.root}>
      <View style={styles.subheader}>
        {!isSearching && (
          <Tabs>
            <Tab active={fungibilityFilter} onPress={handleOnPressAll} label={strings.all} tab="all" />

            <Tab active={fungibilityFilter} onPress={handleOnPressFTs} label={strings.tokens(2)} tab="fts" />

            {balances.nfts.length > 0 && (
              <Tab active={fungibilityFilter} onPress={handleOnPressNFTs} label={strings.nfts(2)} tab="nfts" />
            )}
          </Tabs>
        )}

        {!canAddAmount && (
          <View style={styles.panel}>
            <MaxAmountsPerTx />

            <Spacer height={16} />
          </View>
        )}
      </View>

      <List isSearching={isSearching} canAddAmount={canAddAmount} showOnlyNfts={showOnlyNfts} />

      <Counter fungibilityFilter={fungibilityFilter} counter={counter} />
    </View>
  )
}

type ListProps<T> = {
  showOnlyNfts: boolean
  isSearching: boolean
  canAddAmount: boolean
}
const List = <T,>({showOnlyNfts, isSearching, canAddAmount}: ListProps<T>) => {
  const showNftList = showOnlyNfts && !isSearching

  if (showNftList) return <ListSpendableNfts canAddAmount={canAddAmount} />

  return <ListSpendableBalances fungibilityFilter={fungibilityFilter} canAddAmount={canAddAmount} />
}

const ListSpendableNfts = ({canAddAmount}: {canAddAmount: boolean}) => {
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

type ListSpendableBalancesProps = {
  canAddAmount: boolean
  availableBalances: ReadonlyArray<Portfolio.Token.Amount>
}
const ListSpendableBalances = ({canAddAmount, availableBalances}: ListSpendableBalancesProps) => {
  const {styles} = useStyles()

  return (
    <View style={styles.list}>
      <FlashList
        data={availableBalances}
        renderItem={({item: amount}) => (
          <SelectableAssetItem
            isMainnet={wallet.isMainnet}
            privacyPlaceholder=""
            isPrivacyOff={true}
            amount={amount}
            disabled={!canAddAmount && amount.info.id !== wallet.primaryTokenInfo.id}
          />
        )}
        bounces={false}
        contentContainerStyle={styles.content}
        keyExtractor={(_, index) => index.toString()}
        testID="assetList"
        ItemSeparatorComponent={() => <Spacer height={16} />}
        estimatedItemSize={78}
        ListEmptyComponent={<ListEmptyComponent filteredTokenInfos={filteredTokenInfos} allTokenInfos={tokenInfos} />}
      />
    </View>
  )
}

const Tabs = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.tabs}>{children}</View>
}

type TabProps<T> = {
  onPress: () => void
  active: T
  tab: T
  label: string
}
const Tab = <T,>({onPress, active, tab, label}: TabProps<T>) => {
  const {styles, colors} = useStyles()
  const isActive = active === tab
  const color = isActive ? colors.active : colors.inactive

  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabContainer, isActive && styles.tabContainerActive]}>
      <Text style={[styles.tab, {color}]}>{label}</Text>
    </TouchableOpacity>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; amount: Portfolio.Token.Amount; wallet: YoroiWallet}
const SelectableAssetItem = ({amount, disabled, wallet}: SelectableAssetItemProps) => {
  const {styles} = useStyles()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {closeSearch} = useSearch()
  const {targets, tokenSelectedChanged, amountChanged, selectedTargetIndex, selectedTokenId} = useTransfer()
  const {records: balances} = usePortfolioBalances({wallet})
  const primaryBreakdown = usePortfolioPrimaryBreakdown({wallet})
  const {spendable} = targetGetTokenBalanceBreakdown({
    balances,
    primaryBreakdown,
    selectedTargetIndex,
    selectedTokenId,
    targets,
  })

  const isPrimary = isPrimaryToken(amount.info)

  const handleOnSelect = React.useCallback(() => {
    tokenSelectedChanged(amount.info.id)
    closeSearch()

    // if the balance is atomic there is no need to edit the amount
    if (spendable === 1n && amount.info.decimals === 0) {
      amountChanged({
        info: amount.info,
        quantity: spendable,
      })
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }, [amount.info, amountChanged, closeSearch, navigation, spendable, tokenSelectedChanged])

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={handleOnSelect}
      testID="selectTokenButton"
      disabled={disabled}
    >
      <PortfolioAmountItem amount={{info: amount.info, quantity: spendable}} wallet={wallet} />
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

const Counter = <T,>({fungibilityFilter, counter}: {fungibilityFilter: T; counter: number}) => {
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

  if (!isSearching && fungibilityFilter === 'fts') {
    return (
      <View style={styles.counter}>
        <Text style={styles.counterText}>{strings.youHave}</Text>

        <Text style={styles.counterTextBold}>{` ${counter} ${strings.tokens(counter)}`}</Text>
      </View>
    )
  }

  if (!isSearching && fungibilityFilter === 'nfts') {
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
const filterOutSelected =
  (amounts: Record<Portfolio.Token.Id, Portfolio.Token.Amount>) => (amount: Portfolio.Token.Amount) =>
    !Object.keys(amounts).includes(amount.info.id)
const sortNfts = (nftNameA: string, nftNameB: string): number => nftNameA.localeCompare(nftNameB)

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography, padding} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    subheader: {
      ...padding['x-l'],
    },
    item: {
      ...padding['y-m'],
    },
    borderBottom: {
      borderBottomColor: color.gray[200],
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    panel: {
      ...padding['x-l'],
    },
    tabs: {
      flexDirection: 'row',
    },
    tabContainer: {
      flex: 1,
    },
    tabContainerActive: {
      borderBottomColor: color.primary[600],
      borderBottomWidth: 2,
    },
    tab: {
      textAlign: 'center',
      ...padding['y-m'],
      ...typography['body-1-l-medium'],
    },
    list: {
      flex: 1,
    },
    assetListContent: {
      ...padding['x-l'],
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
      ...typography['heading-3-medium'],
      color: color.gray.max,
      flex: 1,
      textAlign: 'center',
    },
    counter: {
      ...padding['l'],
      justifyContent: 'center',
      flexDirection: 'row',
    },
    counterText: {
      color: color.primary[600],
      ...typography['body-2-m-regular'],
    },
    counterTextBold: {
      color: color.primary[600],
      ...typography['body-2-m-medium'],
    },
  })

  const colors = {
    active: color.primary[600],
    inactive: color.gray[600],
  }

  return {styles, colors}
}
