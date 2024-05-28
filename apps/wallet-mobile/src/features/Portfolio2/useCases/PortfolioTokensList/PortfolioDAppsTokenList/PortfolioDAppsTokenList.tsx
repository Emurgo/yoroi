import {useTheme} from '@yoroi/theme'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {TabPanel} from '../../../../../components/Tabs'
import {useSearch} from '../../../../../features/Search/SearchContext'
import {Line} from '../../../common/Line'
import {useGetLiquidityPool} from '../../../common/useGetLiquidityPool'
import {useGetOpenOrders} from '../../../common/useGetOpenOrders'
import {useGetPortfolioBalance} from '../../../common/useGetPortfolioBalance'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {LendAndBorrowTab} from './LendAndBorrowTab'
import {LiquidityPoolTab} from './LiquidityPoolTab'
import {OpenOrdersTab} from './OpenOrdersTab'
import {PortfolioDAppTabs} from './PortfolioDAppTabs'

export const portfolioDAppsTabs = {
  LIQUIDITY_POOL: 'liquidityPool',
  OPEN_ORDERS: 'openOrders',
  LEND_BORROW: 'lendAndBorrow',
} as const

export type TPortfolioDAppsTabs = (typeof portfolioDAppsTabs)[keyof typeof portfolioDAppsTabs]

export const PortfolioDAppsTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()

  const [activeTab, setActiveTab] = React.useState<TPortfolioDAppsTabs>(portfolioDAppsTabs.LIQUIDITY_POOL)

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
    <ScrollView style={styles.root}>
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

      <PortfolioDAppTabs activeTab={activeTab} onChangeTab={setActiveTab} />

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
    </ScrollView>
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
  })

  return {styles} as const
}
