import {isPrimaryToken} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from 'react-native'

import {Icon, Spacer} from '../../../../../components'
import {makeList} from '../../../../../kernel/utils'
import {PreprodFaucetBanner} from '../../../../Exchange/common/ShowBuyBanner/PreprodFaucetBanner'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {usePortfolioBalances} from '../../../common/hooks/usePortfolioBalances'
import {useGetTokensWithBalance} from '../../../common/useGetTokensWithBalance'
import {useNavigateTo} from '../../../common/useNavigateTo'
import {useStrings} from '../../../common/useStrings'
import {useZeroBalance} from '../../../common/useZeroBalance'
import {BuyADABanner} from './BuyADABanner/BuyADABanner'
import {DashboardTokenItem} from './DashboardTokenItem'
import {DashboardTokenSkeletonItem} from './DashboardTokenSkeletonItem'
import {TradeTokensBanner} from './TradeTokensBanner'

export const DashboardTokensList = () => {
  const {styles, cardItemWidth, cardItemWidthForJustAda} = useStyles()
  const navigationTo = useNavigateTo()
  const isZeroADABalance = useZeroBalance()
  const {isLoading} = useGetTokensWithBalance()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})
  const {
    selected: {network},
  } = useWalletManager()

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
            <View style={[styles.tokenItemContainer, {width: cardItemWidth}]} key={index}>
              <DashboardTokenSkeletonItem />
            </View>
          ))}

          <Spacer width={8} />
        </View>
      )

    return <Spacer width={16} />
  }

  const renderTokensList = () => {
    if (isZeroADABalance) {
      return (
        <View style={styles.container}>
          {network === Chain.Network.Preprod ? <PreprodFaucetBanner /> : <BuyADABanner />}
        </View>
      )
    }

    if (isJustADA) {
      return (
        <View style={styles.justAdaContainer}>
          <View style={[styles.tokenItemContainer, {width: cardItemWidthForJustAda}]}>
            <DashboardTokenItem tokenInfo={tokensList[0]} />
          </View>

          <View style={[styles.tokenItemContainer, {width: cardItemWidthForJustAda}]}>
            <TradeTokensBanner />
          </View>
        </View>
      )
    }

    return (
      <FlatList
        horizontal
        data={tokensList}
        ListHeaderComponent={<Spacer width={16} />}
        ListFooterComponent={renderFooterList()}
        ItemSeparatorComponent={() => <Spacer width={8} />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.info.id}
        renderItem={({item}) => (
          <View style={[styles.tokenItemContainer, {width: cardItemWidth}]}>
            <DashboardTokenItem tokenInfo={item} />
          </View>
        )}
      />
    )
  }

  return (
    <View style={styles.root}>
      <Heading countTokens={tokensList.length} onPress={handleDirectTokensList} isFirstUser={isFirstUser} />

      {renderTokensList()}
    </View>
  )
}

type HeadingProps = {
  countTokens: number
  isFirstUser: boolean
  onPress: () => void
}
const Heading = ({countTokens, onPress, isFirstUser}: HeadingProps) => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, styles.actionsContainer]}>
      <Text style={styles.title}>{strings.tokens(isFirstUser ? 0 : countTokens)}</Text>

      <Icon.ArrowRight color={colors.gray_800} size={24} />
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const {width: SCREEN_WIDTH} = useWindowDimensions()
  const PADDING_LEFT_SIDE = 16
  const PADDING_RIGHT_SIDE_FOR_ITEMS = 15
  const PADDING_RIGHT_SIDE_FOR_JUST_ADA = 16
  const GAP_ITEMS = 8
  const GAP_FOR_JUST_ADA = 16
  const initCardWidth = SCREEN_WIDTH - PADDING_LEFT_SIDE
  const cardItemWidth = (initCardWidth - PADDING_RIGHT_SIDE_FOR_ITEMS - GAP_ITEMS) / 2
  const cardItemWidthForJustAda = (initCardWidth - PADDING_RIGHT_SIDE_FOR_JUST_ADA - GAP_FOR_JUST_ADA) / 2

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
    containerLoading: {
      ...atoms.flex_row,
      ...atoms.gap_sm,
    },
    justAdaContainer: {
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.overflow_hidden,
      ...atoms.w_full,
      ...atoms.pl_lg,
      paddingRight: 15,
      ...atoms.align_start,
    },
    tokenItemContainer: {
      aspectRatio: 195 / 186,
    },
  })

  const colors = {
    gray_800: color.gray_c800,
  }

  return {styles, colors, cardItemWidth, cardItemWidthForJustAda} as const
}
