import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Spacer} from '../../components/Spacer'
import {useExplorers} from '../../features/Explorer/common/useExplorers'
import {usePortfolioBalances} from '../../features/Portfolio/common/hooks/usePortfolioBalances'
import {TokenAmountItem, TokenAmountItemProps} from '../../features/Portfolio/common/TokenAmountItem/TokenAmountItem'
import {usePrivacyMode} from '../../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/Context'
import globalMessages from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
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
  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const {isPrivacyOff, privacyPlaceholder} = usePrivacyMode()

  const [fungibilityFilter, setFungibilityFilter] = React.useState<Exclude<keyof typeof balances, 'records'>>('all')
  const [isPending, startTransition] = React.useTransition()

  const explorers = useExplorers(wallet.network)

  const {track} = useMetrics()
  useFocusEffect(
    React.useCallback(() => {
      track.assetsPageViewed()
    }, [track]),
  )

  const handleOnPressNFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('nfts')), [])
  const handleOnPressFTs = React.useCallback(() => startTransition(() => setFungibilityFilter('fts')), [])
  const handleOnPressAll = React.useCallback(() => startTransition(() => setFungibilityFilter('all')), [])

  const chips = React.useMemo(() => {
    const chiplist = [
      {label: strings.all, onPress: handleOnPressAll, value: 'all', disabled: isPending},
      {
        label: strings.tokens(balances.fts.length),
        onPress: handleOnPressFTs,
        value: 'fts',
        disabled: isPending,
      },
    ]
    if (balances.nfts.length > 0) {
      chiplist.push({
        label: strings.nfts(balances.nfts.length),
        onPress: handleOnPressNFTs,
        value: 'nfts',
        disabled: isPending,
      })
    }
    return chiplist
  }, [balances, handleOnPressAll, handleOnPressFTs, handleOnPressNFTs, isPending, strings])

  return (
    <View style={styles.assetList} testID="assetList">
      <FilterBalancesByType selectedValue={fungibilityFilter} chips={chips} />

      <FlashList
        {...props}
        bounces={false}
        data={balances[fungibilityFilter]}
        renderItem={({item: amount}) => (
          <ExplorableAmount
            network={wallet.network}
            privacyPlaceholder={privacyPlaceholder}
            isPrivacyOff={isPrivacyOff}
            amount={amount}
            onPress={() => Linking.openURL(explorers.cardanoscan.token(amount.info.id))}
          />
        )}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        contentContainerStyle={styles.content}
        keyExtractor={(_, index) => index.toString()}
        estimatedItemSize={78}
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    content: {
      ...atoms.px_lg,
      ...atoms.pt_lg,
      ...atoms.pb_sm,
    },
    assetList: {flex: 1},
    button: {
      ...atoms.p_md,
      backgroundColor: color.gray_cmin,
      shadowColor: color.gray_c100,
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
