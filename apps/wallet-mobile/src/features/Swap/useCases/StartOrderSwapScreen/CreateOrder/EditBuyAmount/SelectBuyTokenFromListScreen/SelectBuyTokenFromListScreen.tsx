import {FlashList} from '@shopify/flash-list'
import {sortTokenInfos} from '@yoroi/portfolio'
import {useSwap, useSwapTokensOnlyVerified} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Spacer, Text} from '../../../../../../../components'
import {AmountItemPlaceholder} from '../../../../../../../components/AmountItem/AmountItem'
import {useMetrics} from '../../../../../../../kernel/metrics/metricsManager'
import {YoroiWallet} from '../../../../../../../yoroi-wallets/cardano/types'
import {usePortfolioBalances} from '../../../../../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenAmountItem} from '../../../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSearch, useSearchOnNavBar} from '../../../../../../Search/SearchContext'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {useSelectedWallet} from '../../../../../../WalletManager/common/hooks/useSelectedWallet'
import {Counter} from '../../../../../common/Counter/Counter'
import {filterBySearch} from '../../../../../common/filterBySearch'
import {useNavigateTo} from '../../../../../common/navigation'
import {ServiceUnavailable} from '../../../../../common/ServiceUnavailable/ServiceUnavailable'
import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const SelectBuyTokenFromListScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()

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
    [styles.item],
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
  const {styles, colors} = useStyles()
  const {wallet} = useSelectedWallet()
  const tokenInfos = useSwapTokensOnlyVerified()
  const {search: assetSearchTerm} = useSearch()
  const balances = usePortfolioBalances({wallet})

  const walletTokenIds = React.useMemo(() => balances.all.map(({info: {id}}) => id), [balances.all])

  const [filteredTokenList, someInWallet] = React.useMemo(() => {
    const list = sortTokenInfos({
      secondaryTokenInfos: tokenInfos.filter(filterBySearch(assetSearchTerm)),
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
    })
    const set = new Set(list.map(({id}) => id))
    set.delete(wallet.portfolioPrimaryTokenInfo.id)
    const someInWallet = walletTokenIds.some((id) => set.has(id))
    return [list, someInWallet]
  }, [tokenInfos, assetSearchTerm, wallet.portfolioPrimaryTokenInfo, walletTokenIds])

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
        renderItem={({item: tokenInfo}: {item: Portfolio.Token.Info}) => (
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

      {someInWallet && (
        <View style={[styles.row, styles.ph]}>
          <Icon.Portfolio size={20} color={colors.lightGreen} />

          <Spacer width={8} />

          <Text style={styles.legend}>{strings.assetsIn}</Text>
        </View>
      )}

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
  tokenInfo: Portfolio.Token.Info
}
const SelectableToken = ({wallet, tokenInfo, walletTokenIds}: SelectableTokenProps) => {
  const {styles} = useStyles()
  const {id, name, ticker} = tokenInfo
  // NOTE: no need to subscribe to the balance
  const balanceAvailable = wallet.balances.records.get(id)?.quantity ?? 0n
  const {closeSearch} = useSearch()
  const {buyTokenInfoChanged, orderData, resetQuantities} = useSwap()
  const {
    sellQuantity: {isTouched: isSellTouched},
    buyQuantity: {isTouched: isBuyTouched},
    buyTouched,
    switchTokens,
  } = useSwapForm()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()

  const inUserWallet = walletTokenIds.includes(tokenInfo.id)
  const shouldUpdateToken = id !== orderData.amounts.buy?.info.id || !isBuyTouched
  const shouldSwitchTokens = id === orderData.amounts.sell?.info.id && isSellTouched

  const handleOnTokenSelection = () => {
    const [policyId] = id.split('.')
    track.swapAssetToChanged({
      to_asset: [{asset_name: name, asset_ticker: ticker, policy_id: policyId}],
    })

    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      resetQuantities()
      switchTokens()
    }

    if (shouldUpdateToken) {
      buyTokenInfoChanged(tokenInfo)
      buyTouched()
    }
    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity style={styles.item} onPress={handleOnTokenSelection} testID="selectTokenButton">
      <TokenAmountItem amount={{info: tokenInfo, quantity: balanceAvailable}} inWallet={inUserWallet} variant="swap" />
    </TouchableOpacity>
  )
}

const EmptyList = ({filteredTokensForList}: {filteredTokensForList: ReadonlyArray<Portfolio.Token.Info>}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0 && filteredTokensForList.length === 0)
    return <EmptySearchResult assetSearchTerm={assetSearchTerm} />

  return null
}

const EmptySearchResult = ({assetSearchTerm}: {assetSearchTerm: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.bg_color_high,
    },
    ph: {
      paddingHorizontal: 16,
    },
    item: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    label: {
      ...atoms.body_3_sm_regular,
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
      backgroundColor: color.gray_c200,
    },
    row: {
      flexDirection: 'row',
      alignSelf: 'center',
    },
    legend: {
      color: color.gray_c900,
      ...atoms.body_2_md_regular,
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
      ...atoms.heading_3_medium,
      fontSize: 20,
      color: color.gray_cmax,
      paddingTop: 4,
      textAlign: 'center',
    },
    counter: {
      paddingVertical: 16,
    },
  })

  const colors = {
    lightGreen: color.secondary_c600,
  }

  return {styles, colors}
}
