import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {TabPanel} from '../../../../../components/Tabs'
import {useSearch} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioPrimaryBalance} from '../../../common/hooks/usePortfolioPrimaryBalance'
import {Line} from '../../../common/Line'
import {useGetLiquidityPool} from '../../../common/useGetLiquidityPool'
import {useGetOpenOrders} from '../../../common/useGetOpenOrders'
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
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})

  const [activeTab, setActiveTab] = React.useState<TPortfolioDAppsTabs>(portfolioDAppsTabs.LIQUIDITY_POOL)

  const {data: liquidityPools, isFetching: liquidityPoolFetching} = useGetLiquidityPool()
  const {data: openOrders, isFetching: openOrdersFetching} = useGetOpenOrders()
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
          <TotalTokensValue amount={primaryBalance} cardType="dapps" />

          <Line />
        </View>
      ) : null}

      <Spacer height={16} />

      <PortfolioDAppTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <TabPanel active={activeTab === 'liquidityPool'}>
        <LiquidityPoolTab
          tokensList={getListLiquidityPool}
          isFetching={liquidityPoolFetching}
          isSearching={isSearching}
        />
      </TabPanel>

      <TabPanel active={activeTab === 'openOrders'}>
        <OpenOrdersTab tokensList={listOpenOrders} isFetching={openOrdersFetching} isSearching={isSearching} />
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
