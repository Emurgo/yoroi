import {isPrimaryToken} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'

import {useNavigateTo} from '~/features/Portfolio/common/hooks/useNavigateTo'
import {usePortfolioBalances} from '~/features/Portfolio/common/hooks/usePortfolioBalances'
import {useStrings} from '~/features/Portfolio/common/hooks/useStrings'
import {useZeroBalance} from '~/features/Portfolio/common/hooks/useZeroBalance'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {DashboardTokenItem} from './DashboardTokenItem'
import {TradeTokensBanner} from './TradeTokensBanner'

export const DashboardTokensList = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {width: SCREEN_WIDTH} = useWindowDimensions()
  const PADDING_LEFT_SIDE = 16
  const PADDING_RIGHT_SIDE_FOR_ITEMS = 15
  const PADDING_RIGHT_SIDE_FOR_JUST_ADA = 16
  const GAP_ITEMS = 8
  const GAP_FOR_JUST_ADA = 16
  const initCardWidth = SCREEN_WIDTH - PADDING_LEFT_SIDE
  const cardItemWidth =
    (initCardWidth - PADDING_RIGHT_SIDE_FOR_ITEMS - GAP_ITEMS) / 2
  const cardItemWidthForJustAda =
    (initCardWidth - PADDING_RIGHT_SIDE_FOR_JUST_ADA - GAP_FOR_JUST_ADA) / 2

  const navigationTo = useNavigateTo()
  const isZeroADABalance = useZeroBalance()
  const {wallet} = useSelectedWallet()
  const balances = usePortfolioBalances({wallet})

  const tokensList = React.useMemo(() => balances.fts ?? [], [balances.fts])

  const isJustADA = React.useMemo(() => {
    if (tokensList.length !== 1) return false
    const tokenInfo = tokensList[0].info
    const isPrimary = isPrimaryToken(tokenInfo)
    return isPrimary
  }, [tokensList])

  const isFirstUser = isJustADA && isZeroADABalance

  const handleDirectTokensList = () => {
    navigationTo.tokensList()
  }

  const renderTokensList = () => {
    if (isJustADA) {
      return (
        <View
          style={[
            a.flex_row,
            a.gap_lg,
            a.overflow_hidden,
            a.w_full,
            a.pl_lg,
            {paddingRight: 15},
            a.align_start,
          ]}
        >
          <View
            style={[{aspectRatio: 195 / 186, width: cardItemWidthForJustAda}]}
          >
            <DashboardTokenItem tokenInfo={tokensList[0]} />
          </View>

          <View
            style={[{aspectRatio: 195 / 186, width: cardItemWidthForJustAda}]}
          >
            <TradeTokensBanner />
          </View>
        </View>
      )
    }

    return (
      <FlatList
        horizontal
        data={tokensList}
        ListHeaderComponent={<Space.Width.md />}
        ItemSeparatorComponent={() => <Space.Width.sm />}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.info?.id}
        renderItem={({item}) => (
          <View style={[{aspectRatio: 195 / 186, width: cardItemWidth}]}>
            <DashboardTokenItem tokenInfo={item} />
          </View>
        )}
      />
    )
  }

  return (
    <View style={[a.flex_col, a.gap_lg]}>
      <Heading
        countTokens={tokensList.length}
        onPress={handleDirectTokensList}
        isFirstUser={isFirstUser}
      />

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
  const {palette: p} = useTheme()
  const strings = useStrings()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[a.px_lg, a.flex_row, a.justify_between, a.align_center]}
    >
      <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
        {strings.tokens(isFirstUser ? 0 : countTokens)}
      </Text>

      <Icon.ArrowRight color={p.gray_800} size={24} />
    </TouchableOpacity>
  )
}
