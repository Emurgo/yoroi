import {useFocusEffect, useNavigation} from '@react-navigation/native'
import {FlashList} from '@shopify/flash-list'
import {infoFilterByName, isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useTransfer} from '@yoroi/transfer'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {Alert, TouchableOpacity, View} from 'react-native'

import {limitOfSecondaryAmountsPerTx} from '~/features/SetupWallet/common/constants'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '~/kernel/navigation/types'
import {NoAssetFoundImage} from '~/ui/NoAssetFoundImage/NoAssetFoundImage'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {usePortfolioBalances} from '../Portfolio/common/hooks/usePortfolioBalances'
import {MediaGallery} from '../Portfolio/common/MediaGallery/MediaGallery'
import {TokenAmountItem} from '../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSearch, useSearchOnNavBar} from '../Search/SearchContext'
import {MaxAmountsPerTx} from './Show/MaxAmountsPerTx'

export const SelectTokenFromListScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {targets, selectedTargetIndex, allocated} = useTransfer()

  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const [fungibilityFilter, setFungibilityFilter] =
    React.useState<Portfolio.FungibilityFilter>('all')
  const [isPending, startTransition] = React.useTransition()

  useSearchOnNavBar({
    placeholder: strings.send.searchTokens,
    title: strings.send.selecteAssetTitle,
  })
  const {visible: isSearchOpened, isSearching, search} = useSearch()
  const shouldShowNfts = fungibilityFilter === 'nfts' && !isSearchOpened

  const spendableAmounts = React.useMemo(() => {
    const allocatedToOtherTargets =
      allocated.get(selectedTargetIndex) ?? new Map()
    const toSpendableAmount = toSpendableAmountMapper(allocatedToOtherTargets)

    return balances.all
      .map(toSpendableAmount)
      .filter(hasSpendableAmount)
      .filter(filterOutSelected(targets[selectedTargetIndex].entry.amounts))
  }, [allocated, balances, selectedTargetIndex, targets])

  const filteredAmounts = React.useMemo(() => {
    if (isSearchOpened === false) {
      if (fungibilityFilter === 'all') return spendableAmounts

      return spendableAmounts.filter(
        amountFilterByType(
          fungibilityFilter === 'fts'
            ? Portfolio.Token.Type.FT
            : Portfolio.Token.Type.NFT,
        ),
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

  const currentAmounts = targets[selectedTargetIndex].entry.amounts
  const hasPrimary = currentAmounts[wallet.portfolioPrimaryTokenInfo.id] != null
  const currentAmountsSize = Object.keys(currentAmounts).length
  const secondaryAmountsCounter = currentAmountsSize - (hasPrimary ? 1 : 0)
  const canAddAmount = secondaryAmountsCounter < limitOfSecondaryAmountsPerTx

  const handleOnPressNFTs = React.useCallback(
    () => startTransition(() => setFungibilityFilter('nfts')),
    [],
  )
  const handleOnPressFTs = React.useCallback(
    () => startTransition(() => setFungibilityFilter('fts')),
    [],
  )
  const handleOnPressAll = React.useCallback(
    () => startTransition(() => setFungibilityFilter('all')),
    [],
  )

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View style={[a.px_lg]}>
        {isSearchOpened === false && (
          <Tabs>
            <Tab
              active={fungibilityFilter}
              onPress={handleOnPressAll}
              label={strings.send.all}
              tab="all"
            />

            <Tab
              active={fungibilityFilter}
              onPress={handleOnPressFTs}
              label={strings.send.tokens(2)}
              tab="fts"
            />

            {balances.nfts.length > 0 && (
              <Tab
                active={fungibilityFilter}
                onPress={handleOnPressNFTs}
                label={strings.send.nfts(2)}
                tab="nfts"
              />
            )}
          </Tabs>
        )}

        {canAddAmount === false && <WarningPanelMaxAmountsReached />}
      </View>

      <View style={[a.flex_1, isPending && {opacity: 0.5}]}>
        {shouldShowNfts ? (
          <ListSpendableNfts
            canAddAmount={canAddAmount}
            spendableAmounts={filteredAmounts}
          />
        ) : (
          <ListSpendables
            canAddAmount={canAddAmount}
            spendableAmounts={filteredAmounts}
            isSearching={isSearching}
            isSearchOpened={isSearchOpened}
          />
        )}
      </View>

      <Counter
        fungibilityFilter={fungibilityFilter}
        counter={filteredAmounts.length}
        isSearchOpened={isSearchOpened}
        isSearching={isSearching}
      />
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
  const isEmpty = spendableAmounts.length === 0

  const handleOnSelect = (amount: Portfolio.Token.Amount) => {
    tokenSelectedChanged(amount.info.id)
    closeSearch()

    // avoid token detected as nft to send all
    if (amount.quantity === 1n && amount.info.decimals === 0) {
      amountChanged(amount)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      // should not happen
      Alert.alert(strings.send.unknownAsset, strings.send.unknownAsset)
    }
  }

  return (
    <MediaGallery
      amounts={spendableAmounts}
      onRefresh={() => undefined}
      onSelect={handleOnSelect}
      readOnly={!canAddAmount}
      isRefreshing={false}
      withVerticalPadding={!isEmpty} // to keep consistency between tabs when the list is not empty
      ListEmptyComponent={
        <NoSpendableAmount
          text={strings.send.noAssetsAddedYet(strings.send.nfts(2))}
        />
      }
    />
  )
}

type ListSpendableBalancesProps = {
  canAddAmount: boolean
  spendableAmounts: ReadonlyArray<Portfolio.Token.Amount>
  isSearching: boolean
  isSearchOpened: boolean
}
const ListSpendables = ({
  canAddAmount,
  spendableAmounts,
  isSearching,
  isSearchOpened,
}: ListSpendableBalancesProps) => {
  return (
    <FlashList
      data={spendableAmounts}
      renderItem={({item: amount}) => (
        <SelectAmount
          amount={amount}
          disabled={!canAddAmount && !isPrimaryToken(amount.info)}
        />
      )}
      bounces={false}
      contentContainerStyle={[a.px_lg]}
      keyExtractor={(_, index) => index.toString()}
      testID="assetList"
      ItemSeparatorComponent={() => <Space.Height.md />}
      estimatedItemSize={78}
      ListEmptyComponent={
        <EmptyStatuses
          isSearchOpened={isSearchOpened}
          isSearching={isSearching}
        />
      }
    />
  )
}

const WarningPanelMaxAmountsReached = () => {
  return (
    <View style={[a.py_lg]}>
      <MaxAmountsPerTx />
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
  const {palette: p} = useTheme()
  const isActive = active === tab
  const color = isActive ? p.primary_600 : p.gray_600

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        a.flex_1,
        isActive && {borderBottomColor: p.primary_600, borderBottomWidth: 2},
      ]}
    >
      <Text
        style={[{textAlign: 'center'}, a.py_md, a.body_1_lg_medium, {color}]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const Tabs = ({children}: {children: React.ReactNode}) => {
  return <View style={{flexDirection: 'row'}}>{children}</View>
}

type SelectAmountProps = {
  disabled?: boolean
  amount: Portfolio.Token.Amount
}
const SelectAmount = ({amount, disabled}: SelectAmountProps) => {
  const {palette: p} = useTheme()
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {closeSearch} = useSearch()
  const {tokenSelectedChanged, amountChanged, targets, selectedTargetIndex} =
    useTransfer()
  const currentAmount =
    targets[selectedTargetIndex].entry.amounts[amount.info.id]

  const isPrimary = isPrimaryToken(amount.info)

  const handleOnSelect = React.useCallback(() => {
    tokenSelectedChanged(amount.info.id)
    closeSearch()

    // if the balance is atomic there is no need to edit the amount
    if (amount.quantity === 1n && amount.info.decimals === 0) {
      amountChanged(amount)
      navigation.navigate('send-list-amounts-to-send')
    } else {
      if (currentAmount == null) {
        amountChanged({
          info: amount.info,
          quantity: 0n,
        })
      }
      navigation.navigate('send-edit-amount')
    }
  }, [
    amount,
    amountChanged,
    closeSearch,
    currentAmount,
    navigation,
    tokenSelectedChanged,
  ])

  return (
    <TouchableOpacity
      style={[
        a.py_md,
        isPrimary && {borderBottomColor: p.gray_200, borderBottomWidth: 1},
      ]}
      onPress={handleOnSelect}
      testID="selectTokenButton"
      disabled={disabled}
    >
      <TokenAmountItem amount={amount} ignorePrivacy />
    </TouchableOpacity>
  )
}

const EmptyStatuses = ({
  isSearching,
  isSearchOpened,
}: {
  isSearching: boolean
  isSearchOpened: boolean
}) => {
  const strings = useStrings()

  if (isSearching) return <EmptySearchResult />

  if (isSearchOpened === false)
    return (
      <NoSpendableAmount
        text={strings.send.noAssetsAddedYet(strings.send.tokens(2))}
      />
    )

  return null
}

const NoSpendableAmount = ({text}: {text: string}) => {
  return (
    <View style={[a.flex_1, {textAlign: 'center'}]}>
      <Space.Height._2xl />

      <NoAssetFoundImage
        style={[a.flex_1, {alignSelf: 'center', width: 200, height: 228}]}
      />

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          {color: p.gray_max, flex: 1, textAlign: 'center'},
        ]}
      >
        {text}
      </Text>
    </View>
  )
}

const EmptySearchResult = () => {
  const strings = useStrings()
  return (
    <View style={[a.flex_1, {textAlign: 'center'}]}>
      <Space.Height._2xl />

      <NoAssetFoundImage
        style={[a.flex_1, {alignSelf: 'center', width: 200, height: 228}]}
      />

      <Space.Height.lg />

      <Text
        style={[
          a.heading_3_medium,
          {color: p.gray_max, flex: 1, textAlign: 'center'},
        ]}
      >
        {strings.send.noAssets}
      </Text>
    </View>
  )
}

const Counter = <T,>({
  fungibilityFilter,
  counter,
  isSearchOpened,
  isSearching,
}: {
  fungibilityFilter: T
  counter: number
  isSearching: boolean
  isSearchOpened: boolean
}) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  if (!isSearchOpened && fungibilityFilter === 'all') {
    return (
      <View style={[a.p_lg, {justifyContent: 'center', flexDirection: 'row'}]}>
        <Text style={[{color: p.primary_600}, a.body_2_md_regular]}>
          {strings.send.youHave}
        </Text>

        <Text
          style={[{color: p.primary_600}, a.body_2_md_medium]}
        >{` ${counter} ${strings.send.assets(counter)}`}</Text>
      </View>
    )
  }

  if (!isSearchOpened && fungibilityFilter === 'fts') {
    return (
      <View style={[a.p_lg, {justifyContent: 'center', flexDirection: 'row'}]}>
        <Text style={[{color: p.primary_600}, a.body_2_md_regular]}>
          {strings.send.youHave}
        </Text>

        <Text
          style={[{color: p.primary_600}, a.body_2_md_medium]}
        >{` ${counter} ${strings.send.tokens(counter)}`}</Text>
      </View>
    )
  }

  if (!isSearchOpened && fungibilityFilter === 'nfts') {
    return (
      <View style={[a.p_lg, {justifyContent: 'center', flexDirection: 'row'}]}>
        <Text style={[{color: p.primary_600}, a.body_2_md_regular]}>
          {strings.send.youHave}
        </Text>

        <Text
          style={[{color: p.primary_600}, a.body_2_md_medium]}
        >{` ${counter} ${strings.send.nfts(counter)}`}</Text>
      </View>
    )
  }

  if (isSearching) {
    return (
      <View style={[a.p_lg, {justifyContent: 'center', flexDirection: 'row'}]}>
        <Text
          style={[{color: p.primary_600}, a.body_2_md_medium]}
        >{`${counter} ${strings.send.assets(counter)} `}</Text>

        <Text style={[{color: p.primary_600}, a.body_2_md_regular]}>
          {strings.send.found}
        </Text>
      </View>
    )
  }

  return null
}

const hasSpendableAmount = (amount: Portfolio.Token.Amount) =>
  amount.quantity > 0n
const filterOutSelected =
  (amounts: Record<Portfolio.Token.Id, Portfolio.Token.Amount>) =>
  (amount: Portfolio.Token.Amount) =>
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
