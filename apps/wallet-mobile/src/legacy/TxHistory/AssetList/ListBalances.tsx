import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useExplorers} from '@yoroi/explorers'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../../components/Spacer'
import {usePortfolioBalances} from '../../../features/Portfolio/common/hooks/usePortfolioBalances'
import {TokenAmountItem, TokenAmountItemProps} from '../../../features/Portfolio/common/TokenAmountItem/TokenAmountItem'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../../kernel/i18n/global-messages'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {FilterBalancesByType} from './FilterBalancesByType'

type ListProps = FlashListProps<Portfolio.Token.Amount>
type Props = Partial<ListProps> & {
  onScroll: ListProps['onScroll']
  refreshing: boolean
  onRefresh: () => void
}
export const ListBalances = (props: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const explorers = useExplorers(wallet.networkManager.network)
  const balances = usePortfolioBalances({wallet})

  const [fungibilityFilter, setFungibilityFilter] = React.useState<Portfolio.FungibilityFilter>('all')
  const [amounts, setAmounts] = React.useState(balances[fungibilityFilter])

  const [loadedAmounts, setLoadedAmounts] = React.useState(amounts.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= amounts.length) return
    const nextBatch = amounts.slice(currentIndex, currentIndex + batchSize)
    setLoadedAmounts([...loadedAmounts, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [amounts, currentIndex, loadedAmounts])

  const [isPending, startTransition] = React.useTransition()

  const {track} = useMetrics()
  useFocusEffect(
    React.useCallback(() => {
      track.assetsPageViewed()
    }, [track]),
  )

  const handleOnChangeFilter = React.useCallback(
    (filter: Portfolio.FungibilityFilter) =>
      startTransition(() => {
        setFungibilityFilter(filter)
        setCurrentIndex(batchSize)
        setAmounts(balances[filter])
        setLoadedAmounts(balances[filter].slice(0, batchSize))
      }),
    [balances],
  )

  const chips = React.useMemo(() => {
    const chiplist = [
      {label: strings.all, onPress: () => handleOnChangeFilter('all'), value: 'all', disabled: isPending},
      {
        label: strings.tokens(balances.fts.length),
        onPress: () => handleOnChangeFilter('fts'),
        value: 'fts',
        disabled: isPending,
      },
    ]
    if (balances.nfts.length > 0) {
      chiplist.push({
        label: strings.nfts(balances.nfts.length),
        onPress: () => handleOnChangeFilter('nfts'),
        value: 'nfts',
        disabled: isPending,
      })
    }
    return chiplist
  }, [balances.fts.length, balances.nfts.length, handleOnChangeFilter, isPending, strings])

  return (
    <View style={styles.assetList} testID="assetList">
      <FilterBalancesByType selectedValue={fungibilityFilter} chips={chips} />

      <FlashList
        {...props}
        bounces={false}
        data={loadedAmounts}
        renderItem={({item: amount}) => (
          <ExplorableAmount
            amount={amount}
            onPress={() => Linking.openURL(explorers.cardanoscan.token(amount.info.id))}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={styles.content}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={78}
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
      />
    </View>
  )
}

type ExplorableAssetItemProps = TokenAmountItemProps & {
  onPress(): void
}
const ExplorableAmount = ({onPress, ...tokenAmountProps}: ExplorableAssetItemProps) => {
  const styles = useStyles()
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} testID="assetSelectorItem">
      <TokenAmountItem {...tokenAmountProps} />
    </TouchableOpacity>
  )
}

const batchSize = 50

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    content: {
      ...atoms.px_lg,
    },
    assetList: {flex: 1},
    button: {
      ...atoms.p_md,
      backgroundColor: color.gray_cmin,
      shadowColor: color.gray_c200,
      borderRadius: 8,
      elevation: 2,
      shadowOffset: {width: 0, height: -2},
      shadowRadius: 10,
      shadowOpacity: 0.08,
    },
  })

  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return React.useRef({
    tokens: (qty: number) => `${intl.formatMessage(globalMessages.tokens, {qty})} (${qty})`,
    nfts: (qty: number) => `${intl.formatMessage(globalMessages.nfts, {qty})} (${qty})`,
    all: intl.formatMessage(globalMessages.all),
  }).current
}
