import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Spacer} from '../../../../components'
import {TabPanel} from '../../../../components/Tabs'
import {useSearch} from '../../../../Search/SearchContext'
import {LendAndBorrowTab} from '../../common/DAppTabs/LendAndBorrowTab'
import {LiquidityPoolTab} from '../../common/DAppTabs/LiquidityPoolTab'
import {OpenOrdersTab} from '../../common/DAppTabs/OpenOrdersTab'
import {Line} from '../../common/Line'
import {TabsGradient} from '../../common/TabsGradient/Tabs'
import {TotalTokensValue} from '../../common/TotalTokensValue/TotalTokensValue'
import {useGetLiquidityPool} from '../../common/useGetLiquidityPool'
import {useGetOpenOrders} from '../../common/useGetOpenOrders'
import {useGetPortfolioBalance} from '../../common/useGetPortfolioBalance'
import {useStrings} from '../../common/useStrings'

const dAppsTabs = {
  LIQUIDITY_POOL: 'liquidityPool',
  OPEN_ORDERS: 'openOrders',
  LEND_BORROW: 'lendAndBorrow',
} as const

type TdAppsTabs = (typeof dAppsTabs)[keyof typeof dAppsTabs]

export const PortfolioDAppsTokenScreen = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()

  const [activeTab, setActiveTab] = React.useState<TdAppsTabs>(dAppsTabs.LIQUIDITY_POOL)

  const {data: portfolioData, isLoading: balanceLoading} = useGetPortfolioBalance()
  const usdExchangeRate = portfolioData?.usdExchangeRate ?? 1

  const currentBalance = new BigNumber(portfolioData?.currentBalance ?? 0)
  const oldBalance = new BigNumber(portfolioData?.oldBalance ?? 0)

  const {data: liquidityPools, isLoading: liquidityPoolLoading} = useGetLiquidityPool()
  const {data: openOrders, isLoading: openOrdersLoading} = useGetOpenOrders()
  const listOpenOrders = openOrders ?? []

  const getListLiquidityPool = React.useMemo(() => {
    const listLiquidityPool = liquidityPools ?? []

    if (isSearching) {
      return listLiquidityPool.filter((token) => token.dex.name.toLowerCase().includes(search.toLowerCase()))
    }

    return listLiquidityPool
  }, [isSearching, search, liquidityPools])

  return (
    <View style={styles.root}>
      {!isSearching ? (
        <View>
          <TotalTokensValue
            balance={currentBalance}
            oldBalance={oldBalance}
            usdExchangeRate={usdExchangeRate}
            isLoading={balanceLoading}
            cardType="dapps"
          />

          <Line />
        </View>
      ) : null}

      <Spacer height={16} />

      <DAppTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <TabPanel active={activeTab === 'liquidityPool'}>
        <LiquidityPoolTab
          tokensList={getListLiquidityPool}
          isLoading={liquidityPoolLoading}
          isSearching={isSearching}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'openOrders'}>
        <OpenOrdersTab tokensList={listOpenOrders} isLoading={openOrdersLoading} isSearching={isSearching} />
      </TabPanel>

      <TabPanel active={activeTab === 'lendAndBorrow'}>
        <LendAndBorrowTab />
      </TabPanel>
    </View>
  )
}

type DAppTabsProps = {
  activeTab: TdAppsTabs
  onChangeTab: (tab: TdAppsTabs) => void
}
const DAppTabs = ({activeTab, onChangeTab}: DAppTabsProps) => {
  const strings = useStrings()

  return (
    <TabsGradient>
      <Tab
        onPress={() => {
          onChangeTab(dAppsTabs.LIQUIDITY_POOL)
        }}
        label={strings.liquidityPool}
        active={activeTab === dAppsTabs.LIQUIDITY_POOL}
      />

      <Tab
        onPress={() => {
          onChangeTab(dAppsTabs.OPEN_ORDERS)
        }}
        label={strings.openOrders}
        active={activeTab === dAppsTabs.OPEN_ORDERS}
      />

      <Tab
        onPress={() => {
          onChangeTab(dAppsTabs.LEND_BORROW)
        }}
        label={strings.lendAndBorrow}
        active={activeTab === dAppsTabs.LEND_BORROW}
      />
    </TabsGradient>
  )
}

type TabProps = {
  label: string
  active: boolean
}
const Tab = ({onPress, label, active}: TouchableOpacityProps & TabProps) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={styles.tabText}>{label}</Text>
    </TouchableOpacity>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      backgroundColor: color.gray_cmin,
    },
    tab: {
      ...atoms.p_sm,
      ...atoms.rounded_sm,
    },
    tabActive: {
      backgroundColor: color.gray_c200,
    },
    tabText: {
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
  })

  return {styles} as const
}
