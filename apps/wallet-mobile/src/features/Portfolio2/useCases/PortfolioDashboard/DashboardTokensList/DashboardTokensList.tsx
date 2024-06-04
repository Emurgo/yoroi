import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {usePortfolioBalances} from '../../../../../features/Portfolio/common/hooks/usePortfolioBalances'
import {useSelectedWallet} from '../../../../../features/WalletManager/context/SelectedWalletContext'
import {makeList} from '../../../../../kernel/utils'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'
import {useZeroBalance} from '../../../common/useZeroBalance'
import {BuyADABanner} from './BuyADABanner/BuyADABanner'
import {DashboardTokenItem} from './DashboardTokenItem'
import {DashboardTokenSkeletonItem} from './DashboardTokenSkeletonItem'
import {TradeTokensBanner} from './TradeTokensBanner'

export const DashboardTokensList = () => {
  const {styles} = useStyles()
  const navigationTo = useNavigateTo()
  const isZeroADABalance = useZeroBalance()
  const {isLoading} = useGetTokensWithBalance()
  const wallet = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})

  const tokensList = React.useMemo(() => balances.fts ?? [], [balances.fts])
  const isJustADA = React.useMemo(() => {
    if (tokensList.length >= 2) return false
    const tokenInfo = tokensList[0].info
    const isPrimary = isPrimaryToken(tokenInfo)
    return isPrimary
  }, [tokensList])

  const isFirstUser = isJustADA && isZeroADABalance

  const handleDirectTokensList = () => {
    navigationTo.tokensList()
  }

  const renderFooterList = () => {
    if (isLoading)
      return (
        <View style={styles.containerLoading}>
          <View />

          {makeList(3).map((_, index) => (
            <DashboardTokenSkeletonItem key={index} />
          ))}

          <Spacer width={8} />
        </View>
      )

    return (
      <View style={styles.tradeTokensContainer}>
        {isJustADA && (
          <View style={styles.tradeTokensContainer}>
            <Spacer width={16} />

            <TradeTokensBanner />
          </View>
        )}

        <Spacer width={16} />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <Heading countTokens={tokensList.length} onPress={handleDirectTokensList} isFirstUser={isFirstUser} />

      {isZeroADABalance ? (
        <View style={styles.container}>
          <BuyADABanner />
        </View>
      ) : (
        <FlatList
          horizontal
          data={tokensList}
          ListHeaderComponent={<Spacer width={16} />}
          ListFooterComponent={renderFooterList()}
          ItemSeparatorComponent={() => <Spacer width={8} />}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.info.id}
          renderItem={({item}) => <DashboardTokenItem key={item?.info?.id} tokenInfo={item} />}
        />
      )}
    </View>
  )
}

type HeadingProps = {
  countTokens: number
  isFirstUser: boolean
  onPress: () => void
}
const Heading = ({countTokens, onPress, isFirstUser}: HeadingProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={[styles.container, styles.actionsContainer]}>
      <Text style={styles.title}>{strings.tokens(isFirstUser ? 0 : countTokens)}</Text>

      <TouchTokensList onPress={onPress} />
    </View>
  )
}

const TouchTokensList = ({onPress}: TouchableOpacityProps) => (
  <TouchableOpacity onPress={onPress}>
    <Icon.ArrowRight size={24} />
  </TouchableOpacity>
)

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
    },
    root: {
      ...atoms.flex_col,
      ...atoms.gap_lg,
    },
    actionsContainer: {
      ...atoms.flex_row,
      ...atoms.justify_between,
      ...atoms.align_center,
    },
    title: {
      ...atoms.body_1_lg_medium,
      color: color.gray_c900,
    },
    tradeTokensContainer: {
      ...atoms.flex_row,
      ...atoms.flex_1,
    },
    containerLoading: {
      ...atoms.flex_row,
      ...atoms.gap_sm,
    },
  })

  return {styles} as const
}
