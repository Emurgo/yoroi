import {FlashList} from '@shopify/flash-list'
import {useSwap, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {Balance} from '@yoroi/types'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
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
import {Amounts} from '../../../../../../../yoroi-wallets/utils'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {Counter} from '../../../../../common/Counter/Counter'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {sortTokensByName} from '../../../../../common/helpers'
import {useNavigateTo} from '../../../../../common/navigation'
import {ServiceUnavailable} from '../../../../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const SelectBuyTokenFromListScreen = () => {
  const strings = useStrings()

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

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTo,
  })

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Boundary loading={loading}>
        <ErrorBoundary
          fallbackRender={({resetErrorBoundary}) => <ServiceUnavailable resetErrorBoundary={resetErrorBoundary} />}
        >
          <TokenList />
        </ErrorBoundary>
      </Boundary>
    </SafeAreaView>
  )
}

const TokenList = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {onlyVerifiedTokens, isLoading} = useSwapTokensOnlyVerified()
  const {search: assetSearchTerm} = useSearch()
  const balances = useBalances(wallet)
  const walletTokenIds = Amounts.toArray(balances).map(({tokenId}) => tokenId)

  const tokenInfos: Array<Balance.TokenInfo> = React.useMemo(() => {
    if (onlyVerifiedTokens === undefined) return []
    return onlyVerifiedTokens
  }, [onlyVerifiedTokens])

  const filteredTokenList = React.useMemo(() => {
    const filter = filterBySearch(assetSearchTerm)
    return tokenInfos.filter((tokenInfo) => filter(tokenInfo)).sort((a, b) => sortTokensByName(a, b, wallet))
  }, [tokenInfos, assetSearchTerm, wallet])

  return (
    <View style={styles.list}>
      {filteredTokenList?.length > 0 && (
        <View style={styles.ph}>
          <Spacer height={16} />

          <View style={styles.labels}>
            <Text style={styles.label}>{strings.asset}</Text>
          </View>

          <Spacer height={16} />

          <View style={styles.line} />
        </View>
      )}

      <FlashList
        data={filteredTokenList}
        renderItem={({item: tokenInfo}: {item: Balance.TokenInfo}) => (
          <Boundary loading={{fallback: <AmountItemPlaceholder style={styles.item} />}}>
            <SelectableToken tokenInfo={tokenInfo} wallet={wallet} walletTokenIds={walletTokenIds} />
          </Boundary>
        )}
        bounces={false}
        keyExtractor={({id, name}) => `${name}-${id}`}
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
  wallet: YoroiWallet
  walletTokenIds: Array<string>
  tokenInfo: Balance.TokenInfo
}
const SelectableToken = ({wallet, tokenInfo, walletTokenIds}: SelectableTokenProps) => {
  const {id, name, ticker, group, decimals} = tokenInfo
  const balanceAvailable = useBalance({wallet, tokenId: id})
  const {closeSearch} = useSearch()
  const {buyTokenInfoChanged, orderData} = useSwap()
  const {
    sellQuantity: {isTouched: isSellTouched},
    buyTouched,
  } = useSwapForm()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const isDisabled = id === orderData.amounts.sell.tokenId && isSellTouched
  const inUserWallet = walletTokenIds.includes(tokenInfo.id)
  const isSameToken = id === orderData.amounts.buy.tokenId

  const handleOnTokenSelection = () => {
    track.swapAssetToChanged({
      to_asset: [{asset_name: name, asset_ticker: ticker, policy_id: group}],
    })
    if (!isSameToken) {
      buyTokenInfoChanged({
        decimals: decimals ?? 0,
        id: id,
      })
      buyTouched()
    }
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
        amount={{tokenId: id, quantity: balanceAvailable}}
        wallet={wallet}
        status="verified"
        inWallet={inUserWallet}
        variant="swap"
      />
    </TouchableOpacity>
  )
}

const EmptyList = ({filteredTokensForList}: {filteredTokensForList: Array<Balance.TokenInfo>}) => {
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
