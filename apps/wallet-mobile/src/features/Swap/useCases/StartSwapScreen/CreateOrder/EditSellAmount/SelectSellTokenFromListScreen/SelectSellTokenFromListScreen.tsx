import {FlashList} from '@shopify/flash-list'
import {infoFilterByName} from '@yoroi/portfolio'
import {useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer, Text} from '../../../../../../../components'
import {useMetrics} from '../../../../../../../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../../../../../../../Search/SearchContext'
import {usePortfolioBalances} from '../../../../../../Portfolio/common/hooks/usePortfolioBalances'
import {TokenAmountItem} from '../../../../../../Portfolio/common/TokenAmountItem/TokenAmountItem'
import {NoAssetFoundImage} from '../../../../../../Send/common/NoAssetFoundImage'
import {getTokenIdParts} from '../../../../../../WalletManager/common/helpers/get-token-id-parts'
import {useSelectedWallet} from '../../../../../../WalletManager/context/SelectedWalletContext'
import {Counter} from '../../../../../common/Counter/Counter'
import {useNavigateTo} from '../../../../../common/navigation'
import {useStrings} from '../../../../../common/strings'
import {useSwapForm} from '../../../../../common/SwapFormProvider'

export const SelectSellTokenFromListScreen = () => {
  const strings = useStrings()
  const styles = useStyles()

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapFrom,
  })

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <TokenList />
    </SafeAreaView>
  )
}

const TokenList = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const {search, isSearching} = useSearch()

  const filteredAmounts = React.useMemo(() => {
    const byName = infoFilterByName(search)
    return isSearching ? balances.fts.filter(({info}) => byName(info)) : balances.fts
  }, [balances.fts, isSearching, search])

  const [loadedAmounts, setLoadedAmounts] = React.useState(filteredAmounts.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= filteredAmounts.length) return
    const nextBatch = filteredAmounts.slice(currentIndex, currentIndex + batchSize)
    setLoadedAmounts([...loadedAmounts, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, filteredAmounts, loadedAmounts])

  return (
    <View style={styles.list}>
      {filteredAmounts?.length > 0 && (
        <View style={styles.ph}>
          <View style={styles.labels}>
            <Text style={styles.label}>{strings.asset}</Text>

            <Text style={styles.label}>{strings.balance}</Text>
          </View>

          <Spacer height={16} />

          <View style={styles.line} />
        </View>
      )}

      <FlashList
        data={isSearching ? filteredAmounts : loadedAmounts}
        renderItem={({item: amount}) => <SelectableToken amount={amount} />}
        bounces={false}
        keyExtractor={(_, index) => index.toString()}
        testID="assetsList"
        estimatedItemSize={72}
        ListEmptyComponent={<Empty />}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
      />

      <Counter
        counter={filteredAmounts.length}
        style={styles.counter}
        unitsText={strings.assets(filteredAmounts.length)}
        closingText={strings.available}
      />
    </View>
  )
}

const SelectableToken = ({amount}: {amount: Portfolio.Token.Amount}) => {
  const styles = useStyles()
  const {closeSearch} = useSearch()
  const {sellTokenInfoChanged, orderData, resetQuantities} = useSwap()
  const {
    buyQuantity: {isTouched: isBuyTouched},
    sellQuantity: {isTouched: isSellTouched},
    sellTouched,
    switchTokens,
  } = useSwapForm()
  const navigateTo = useNavigateTo()
  const {track} = useMetrics()
  const {policyId} = getTokenIdParts(amount.info.id)

  const shouldUpdateToken = amount.info.id !== orderData.amounts.sell.tokenId || !isSellTouched
  const shouldSwitchTokens = amount.info.id === orderData.amounts.buy.tokenId && isBuyTouched

  const handleOnTokenSelection = () => {
    track.swapAssetFromChanged({
      from_asset: [{asset_name: amount.info.name, asset_ticker: amount.info.ticker, policy_id: policyId}],
    })

    // useCase - switch tokens when selecting the same already selected token on the other side
    if (shouldSwitchTokens) {
      resetQuantities()
      switchTokens()
    }

    if (shouldUpdateToken) {
      sellTouched()
      sellTokenInfoChanged({
        id: amount.info.id,
        decimals: amount.info.decimals,
      })
    }

    navigateTo.startSwap()
    closeSearch()
  }

  return (
    <TouchableOpacity style={styles.item} onPress={handleOnTokenSelection} testID="selectTokenButton">
      <TokenAmountItem amount={amount} ignorePrivacy />
    </TouchableOpacity>
  )
}

const Empty = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {search} = useSearch()

  return (
    <View style={styles.imageContainer}>
      <Spacer height={50} />

      <NoAssetFoundImage style={styles.image} />

      <Spacer height={25} />

      <Text style={styles.contentText}>{search === '' ? strings.noAssetsFound : strings.noAssetsFoundFor(search)}</Text>
    </View>
  )
}

const batchSize = 20

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    label: {
      ...atoms.body_3_sm_regular,
    },
    labels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    container: {
      flex: 1,
      backgroundColor: color.gray_cmin,
      display: 'flex',
      justifyContent: 'flex-start',
    },
    ph: {
      paddingHorizontal: 16,
    },
    item: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    line: {
      height: 1,
      backgroundColor: color.gray_c200,
    },
    list: {
      paddingTop: 16,
      flex: 1,
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
      ...atoms.heading_4_medium,
      color: color.gray_cmax,
      paddingTop: 4,
      textAlign: 'center',
    },
    counter: {
      paddingVertical: 16,
    },
  })

  return styles
}
