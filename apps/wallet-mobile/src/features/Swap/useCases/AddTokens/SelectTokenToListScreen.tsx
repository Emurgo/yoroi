export type FungibilityFilter = 'all' | 'ft' | 'nft'
import {FlashList} from '@shopify/flash-list'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {Switch} from 'react-native-paper'

import {Boundary, Icon, Spacer, Text} from '../../../../components'
import {AmountItem} from '../../../../components/AmountItem/AmountItem'
import {useSearch, useSearchOnNavBar} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {COLORS} from '../../../../theme'
import {sortTokenInfos} from '../../../../utils'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useAllTokenInfos, useIsWalletEmpty} from '../../../../yoroi-wallets/hooks'
import {filterBySearch} from '../../common/filterBySearch'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap, useTokenQuantities} from '../../common/SwapContext'

export const SelectTokenToListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  return (
    <View style={styles.root}>
      <View style={styles.subheader}></View>

      <List />
    </View>
  )
}

const List = () => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(true)
  const strings = useStrings()

  const onToggleSwitch = () => setIsSwitchOn(!isSwitchOn)

  return (
    <>
      <View>
        <Spacer height={12} />

        <View style={[styles.flex]}>
          <View style={styles.row}>
            <Icon.CheckFilled size={28} color={COLORS.SHELLEY_BLUE} />

            <Text style={styles.topText}>{strings.verifiedBy}</Text>

            <Spacer width={8} />

            <Icon.Info size={24} />
          </View>

          <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color={COLORS.SHELLEY_BLUE} />
        </View>

        <Spacer height={15} />

        <View style={[styles.row]}>
          <Icon.Portfolio size={20} color={COLORS.LIGHT_GREEN} />

          <Spacer width={8} />

          <Text style={styles.topText}>{strings.assetsIn}</Text>
        </View>
      </View>

      <Spacer height={24} />

      <AssetList />
    </>
  )
}

const AssetList = () => {
  const wallet = useSelectedWallet()
  const tokenInfos = useAllTokenInfos({wallet})
  const filteredTokenInfos = useFilteredTokenInfos({tokenInfos})

  return (
    <View style={styles.list}>
      <FlashList
        data={filteredTokenInfos}
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
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={78}
      />

      <Counter counter={filteredTokenInfos.length} />
    </View>
  )
}

type SelectableAssetItemProps = {disabled?: boolean; tokenInfo: Balance.TokenInfo; wallet: YoroiWallet}
const SelectableAssetItem = ({tokenInfo, wallet}: SelectableAssetItemProps) => {
  const {closeSearch} = useSearch()
  const {tokenToSelectedChanged} = useSwap()
  const {spendable} = useTokenQuantities(tokenInfo.id)
  const navigateTo = useNavigateTo()
  const isPrimary = tokenInfo.id === wallet.primaryTokenInfo.id

  const onSelect = () => {
    tokenToSelectedChanged(tokenInfo.id)
    navigateTo.swapTokens()
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isPrimary && styles.borderBottom]}
      onPress={onSelect}
      testID="selectTokenButton"
    >
      <AmountItem amount={{tokenId: tokenInfo.id, quantity: spendable}} wallet={wallet} variant="swap" />
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

const useFilteredTokenInfos = ({tokenInfos}: {tokenInfos: Array<Balance.TokenInfo>}) => {
  const wallet = useSelectedWallet()
  const {search: assetSearchTerm, visible: isSearching} = useSearch()
  const isWalletEmpty = useIsWalletEmpty(wallet)

  /*
   * to show the empty list component:
   *    - filteredTokenInfos has primary token when the search term and the wallet are empty and the ft or all tab are selected
   */

  if (isWalletEmpty && !isSearching && tokenInfos?.length === 0) return []
  // swap-select-tokens
  const filteredTokenInfos = tokenInfos.filter(filterBySearch(assetSearchTerm))

  return sortTokenInfos({
    wallet,
    tokenInfos: filteredTokenInfos,
  })
}

const styles = StyleSheet.create({
  root: {
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
  borderBottom: {
    borderBottomColor: COLORS.BORDER_GRAY,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
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
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topText: {
    fontSize: 16,
  },
})
