import {FlashList} from '@shopify/flash-list'
import {useSwap, useSwapTokensByPairToken} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Spacer, Text} from '../../../../../../../components'
import {AmountItem, AmountItemPlaceholder} from '../../../../../../../components/AmountItem/AmountItem'
import {useMetrics} from '../../../../../../../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../../../SelectedWallet'
import {COLORS} from '../../../../../../../theme'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {useBalance, useBalances} from '../../../../../../../yoroi-wallets/hooks'
import {Amounts, asQuantity, Quantities} from '../../../../../../../yoroi-wallets/utils'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {Counter} from '../../../../../common/Counter/Counter'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'
import {useSwapTouched} from '../../../../../common/SwapFormProvider'

export const SelectBuyTokenFromListScreen = () => {
  const strings = useStrings()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  const loading = React.useMemo(
    () => ({
      fallback: (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {Array.from({length: 6}).map((_, i) => (
            <AmountItemPlaceholder key={i} style={styles.item} />
          ))}
        </View>
      ),
    }),
    [],
  )

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Boundary loading={loading}>
        <TokenList />
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {pairsByToken} = useSwapTokensByPairToken('')
  const {search: assetSearchTerm} = useSearch()
  const balances = useBalances(wallet)
  const walletTokenIds = Amounts.toArray(balances).map(({tokenId}) => tokenId)

  const tokens: Array<Balance.Token> = React.useMemo(() => {
    if (pairsByToken === undefined) return []
    return pairsByToken
  }, [pairsByToken])

  const filteredTokenList = React.useMemo(() => {
    const filter = filterBySearch(assetSearchTerm)
    return tokens.filter((token) => filter(token.info))
  }, [tokens, assetSearchTerm])

  return (
    <View style={styles.list}>
      {filteredTokenList?.length > 0 && (
        <View style={styles.ph}>
          <Spacer height={16} />

          <View style={styles.labels}>
            <Text style={styles.label}>{strings.asset}</Text>

            <Text style={styles.label}>{strings.volume}</Text>
          </View>

          <Spacer height={16} />

          <View style={styles.line} />
        </View>
      )}

      <FlashList
        data={filteredTokenList}
        renderItem={({item: token}: {item: Balance.Token}) => (
          <Boundary loading={{fallback: <AmountItemPlaceholder style={styles.item} />}}>
            <SelectableToken
              token={token}
              wallet={wallet}
              walletTokenIds={walletTokenIds}
            />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({info: {id, name}}) => `${name}-${id}`}
        testID="assetsList"
        estimatedItemSize={72}
        ListEmptyComponent={<EmptyList filteredTokensForList={filteredTokenList} />}
      />

      <Spacer height={16} />

      <View style={[styles.row, styles.ph]}>
        <Icon.Portfolio size={20} color={COLORS.LIGHT_GREEN} />

        <Spacer width={8} />

        <Text style={styles.legend}>{strings.assetsIn}</Text>
      </View>

      <Counter
        counter={filteredTokenList.length}
        style={styles.counter}
        unitsText={strings.assets(filteredTokenList.length)}
        closingText={strings.available}
      />
    </View>
  )
}

type SelectableTokenProps = {
  disabled?: boolean
  wallet: YoroiWallet
  walletTokenIds: Array<string>
  token: Balance.Token
}
const SelectableToken = ({wallet, token, walletTokenIds}: SelectableTokenProps) => {
  const balanceAvailable = useBalance({wallet, tokenId: token.info.id})
  const {closeSearch} = useSearch()
  const {buyTokenIdChanged, orderData} = useSwap()
  const {buyTouched, isSellTouched} = useSwapTouched()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const isDisabled = token.info.id === orderData.amounts.sell.tokenId && isSellTouched
  const inUserWallet = walletTokenIds.includes(token.info.id)
  const supplyFormatted = Quantities.format(asQuantity(token.supply?.total), token.info.decimals ?? 0)

  const handleOnTokenSelection = () => {
    track.swapAssetToChanged({
      to_asset: [{asset_name: token.info.name, asset_ticker: token.info.ticker, policy_id: token.info.group}],
    })
    buyTokenIdChanged(token.info.id)
    buyTouched()
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity
      style={[styles.item, isDisabled && styles.disabled]}
      onPress={handleOnTokenSelection}
      testID="selectTokenButton"
      disabled={isDisabled}
    >
      <AmountItem
        amount={{tokenId: token.info.id, quantity: balanceAvailable}}
        wallet={wallet}
        status={token.status}
        inWallet={inUserWallet}
        supply={supplyFormatted}
        variant="swap"
      />
    </TouchableOpacity>
  )
}

const EmptyList = ({filteredTokensForList}: {filteredTokensForList: Array<Balance.Token>}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0 && filteredTokensForList.length === 0)
    return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  return (
    <View style={styles.imageContainer}>
      <Spacer height={50} />

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>
        {assetSearchTerm === '' ? strings.noAssetsFound : strings.noAssetsFoundFor(assetSearchTerm)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  ph: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
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
  list: {
    flex: 1,
  },
  line: {
    height: 1,
    backgroundColor: COLORS.BORDER_GRAY,
  },
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  legend: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Rubik',
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
    fontFamily: 'Rubik-Medium',
    fontSize: 20,
    color: '#000',
    paddingTop: 4,
  },
  counter: {
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
})
