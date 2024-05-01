import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {infoFilterByName, isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Balance, Portfolio} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer, Text} from '../../../../../components'
import {NftImageGallery} from '../../../../../components/NftImageGallery'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../../../navigation'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {sortTokenInfos} from '../../../../../utils'
import {limitOfSecondaryAmountsPerTx} from '../../../../../yoroi-wallets/contants'
import {useIsWalletEmpty} from '../../../../../yoroi-wallets/hooks'
import {usePortfolioBalances} from '../../../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenAmountItem} from '../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
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
  const {targets, selectedTargetIndex, allocated} = useTransfer()

  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const [fungibilityFilter, setFungibilityFilter] = React.useState<Exclude<keyof typeof balances, 'records'>>('all')
  const [isPending, startTransition] = React.useTransition()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.selecteAssetTitle,
  })
  const {visible: isSearchOpened, isSearching, search} = useSearch()
  const showNfts_ShouldntBeSearching = fungibilityFilter === 'nfts' && !isSearchOpened

  const spendableAmounts = React.useMemo(() => {
    const allocatedToOtherTargets = allocated.get(selectedTargetIndex) ?? new Map()
    const toSpendableAmount = toSpendableAmountMapper(allocatedToOtherTargets)

    return balances.all.map(toSpendableAmount).filter(filterOutSelected(targets[selectedTargetIndex].entry.amounts))
  }, [allocated, balances, selectedTargetIndex, targets])

  const filteredAmounts = React.useMemo(() => {
    if (isSearchOpened === false) {
      if (fungibilityFilter === 'all') return spendableAmounts

      return spendableAmounts.filter(
        amountFilterByType(fungibilityFilter === 'fts' ? Portfolio.Token.Type.FT : Portfolio.Token.Type.NFT),
      )
    }

    return spendableAmounts.filter(({info}) => infoFilterByName(search)(info))
  }, [fungibilityFilter, isSearchOpened, search, spendableAmounts])

  const {track} = useMetrics()
  useFocusEffect(
    React.useCallback(() => {
      track.sendSelectAssetPageViewed()
    }, [track]),
  )

  // to redirect the user automatically there is no amount added
  const hasTokensSelected = Object.keys(targets[selectedTargetIndex].entry.amounts).length > 0
  useOverridePreviousSendTxRoute(hasTokensSelected ? 'send-list-amounts-to-send' : 'send-start-tx')

  const secondaryAmountsCounter = useSelectedSecondaryAmountsCounter(wallet)
  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx

  const handleOnPressNFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('nfts')), [])
  const handleOnPressFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('fts')), [])
  const handleOnPressAll = React.useCallback(() => startTransition(() => setFungibilityFilter('all')), [])

  return (
    <View style={styles.root}>
      <View style={styles.subheader}>
        {isSearchOpened === false && (
          <Tabs>
            <Tab active={fungibilityFilter} onPress={handleOnPressAll} label={strings.all} tab="all" />

            <Tab active={fungibilityFilter} onPress={handleOnPressFTs} label={strings.tokens(2)} tab="fts" />

            {balances.nfts.length > 0 && (
              <Tab active={fungibilityFilter} onPress={handleOnPressNFTs} label={strings.nfts(2)} tab="nfts" />
            )}
          </Tabs>
        )}

        {canAddAmount === false && <WarningPanelMaxAmountsReached />}
      </View>

      <View style={styles.list}>
        {showNfts_ShouldntBeSearching ? (
          <ListSpendableNfts canAddAmount={canAddAmount} spendableAmounts={filteredAmounts} />
        ) : (
          <ListSpendables
            canAddAmount={canAddAmount}
            spendableAmounts={filteredAmounts}
            isMainnet={wallet.isMainnet}
            isSearching={isSearching}
            isSearchOpened={isSearchOpened}
          />
        )}
      </View>

      <Counter fungibilityFilter={fungibilityFilter} counter={spendableAmounts.length} />
    </View>
  )
}

const ListSpendableNfts = ({
  canAddAmount,
  spendableAmounts,
}: {
  canAddAmount: boolean
  spendableAmounts: ReadonlyArray<Portfolio.Token.Amount>
}) => {
  const strings = useStrings()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged, amountChanged} = useTransfer()
  const isEmpty = spendableAmounts.length > 0

  const handleOnSelect = (amount: Portfolio.Token.Amount) => {
    tokenSelectedChanged(amount.info.id)
    closeSearch()

    amountChanged(amount)
    navigation.navigate('send-list-amounts-to-send')
  }

  return (
    <NftImageGallery
      nfts={spendableAmounts}
      onRefresh={() => undefined}
      onSelect={handleOnSelect}
      readOnly={!canAddAmount}
      isRefreshing={false}
      withVerticalPadding={!isEmpty} // to keep consistency between tabs when the list is not empty
      ListEmptyComponent={isEmpty ? <NoAssetsYet text={strings.noAssetsAddedYet(strings.nfts(2))} /> : null}
    />
  )
}

type ListSpendableBalancesProps = {
  canAddAmount: boolean
  spendableAmounts: ReadonlyArray<Portfolio.Token.Amount>
  isMainnet: boolean
  isSearching: boolean
  isSearchOpened: boolean
}
const ListSpendables = ({
  canAddAmount,
  spendableAmounts,
  isMainnet,
  isSearching,
  isSearchOpened,
}: ListSpendableBalancesProps) => {
  const {styles} = useStyles()

  return (
    <FlashList
      data={spendableAmounts}
      renderItem={({item: amount}) => (
        <SelectAmount amount={amount} disabled={!canAddAmount && !isPrimaryToken(amount.info)} isMainnet={isMainnet} />
      )}
      bounces={false}
      contentContainerStyle={styles.spendableAmountsContent}
      keyExtractor={(_, index) => index.toString()}
      testID="assetList"
      ItemSeparatorComponent={() => <Spacer height={16} />}
      estimatedItemSize={78}
      ListEmptyComponent={<EmptySearchResult_Or_NoAmounts isSearchOpened={isSearchOpened} isSearching={isSearching} />}
    />
  )
}

const WarningPanelMaxAmountsReached = () => {
  const {styles} = useStyles()
  return (
    <View style={styles.panel}>
      <MaxAmountsPerTx />

      <Spacer height={16} />
    </View>
  )
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

const Tabs = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.tabs}>{children}</View>
}

type SelectAmountProps = {
  disabled?: boolean
  amount: Portfolio.Token.Amount
  isMainnet: boolean
}
const SelectAmount = ({amount, disabled, isMainnet = true}: SelectAmountProps) => {
  const {styles} = useStyles()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged, amountChanged} = useTransfer()

  const isPrimary = isPrimaryToken(amount.info)

  const handleOnSelect = React.useCallback(() => {
    tokenSelectedChanged(amount.info.id)
    closeSearch()

    // if the balance is atomic there is no need to edit the amount
    if (amount.quantity === 1n && amount.info.decimals === 0) {
      amountChanged(amount)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      navigation.navigate('send-edit-amount')
    }
  }, [amount, amountChanged, closeSearch, navigation, tokenSelectedChanged])

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={handleOnSelect}
      testID="selectTokenButton"
      disabled={disabled}
    >
      <TokenAmountItem amount={amount} isMainnet={isMainnet} isPrivacyOff={true} privacyPlaceholder="" />
    </TouchableOpacity>
  )
}

const EmptySearchResult_Or_NoAmounts = ({
  isSearching,
  isSearchOpened,
}: {
  isSearching: boolean
  isSearchOpened: boolean
}) => {
  const strings = useStrings()

  if (isSearching) return <EmptySearchResult />

  if (isSearchOpened === false) return <NoAssetsYet text={strings.noAssetsAddedYet(strings.tokens(2))} />

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
const toSpendableAmountMapper =
  (allocated: Map<Portfolio.Token.Id, bigint>) =>
  (amount: Portfolio.Token.Amount): Portfolio.Token.Amount => ({
    info: amount.info,
    quantity: amount.quantity - (allocated.get(amount.info.id) ?? 0n),
  })
const amountFilterByType =
  (type: Portfolio.Token.Type) =>
  (amount: Portfolio.Token.Amount): boolean =>
    amount.info.type === type

const useStyles = () => {
  const {atoms, color} = useTheme()
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
    spendableAmountsContent: {
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
    active: color.primary_c600,
    inactive: color.gray_c600,
  }

  return {styles, colors}
}
