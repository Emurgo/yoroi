import {infoExtractName} from '@yoroi/portfolio'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {TabPanel} from '../../../../../components/Tabs'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useSearch} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {ILiquidityPool, useGetLiquidityPool} from '../../../common/hooks/useGetLiquidityPool'
import {IOpenOrders, useGetOpenOrders} from '../../../common/hooks/useGetOpenOrders'
import {usePortfolioPrimaryBalance} from '../../../common/hooks/usePortfolioPrimaryBalance'
import {Line} from '../../../common/Line'
import {portfolioDAppsTabs, TPortfolioDAppsTabs} from '../../../common/types'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {LendAndBorrowTab} from './LendAndBorrowTab'
import {LiquidityPoolTab} from './LiquidityPoolTab'
import {OpenOrdersTab} from './OpenOrdersTab'
import {PortfolioDAppTabs} from './PortfolioDAppTabs'

export const PortfolioDAppsTokenList = () => {
  const {styles} = useStyles()
  const {search, isSearching} = useSearch()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})

  const [activeTab, setActiveTab] = React.useState<TPortfolioDAppsTabs>(portfolioDAppsTabs.LIQUIDITY_POOL)

  const {data: liquidityPools, isFetching: liquidityPoolFetching} = useGetLiquidityPool()
  const {data: openOrders, isFetching: openOrdersFetching} = useGetOpenOrders()

  const filterListWithSearch = React.useCallback(
    <T extends ILiquidityPool & IOpenOrders>(tokensList: T[]) => {
      return tokensList.filter((token) => {
        const tokenNameFirst = infoExtractName(token.assets[0].info)
        const tokenNameSecond = infoExtractName(token.assets[1].info)
        return (
          token.dex.name.toLowerCase().includes(search.toLowerCase()) ||
          tokenNameFirst.toLowerCase().includes(search.toLowerCase()) ||
          tokenNameSecond.toLowerCase().includes(search.toLowerCase())
        )
      })
    },
    [search],
  )

  const getListLiquidityPool = React.useMemo(() => {
    const listLiquidityPool = liquidityPools ?? []

    if (isSearching) {
      return filterListWithSearch(listLiquidityPool)
    }

    return listLiquidityPool
  }, [liquidityPools, isSearching, filterListWithSearch])

  const getListOpenOrders = React.useMemo(() => {
    const listOpenOrders = openOrders ?? []

    if (isSearching) {
      return filterListWithSearch(listOpenOrders)
    }

    return listOpenOrders
  }, [openOrders, isSearching, filterListWithSearch])

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined

    const sendMetrics = () => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        track.portfolioTokensListSearchActivated({search_term: search})
      }, 500) // 0.5s requirement
    }

    if (isSearching && search.length > 0) sendMetrics()

    return () => clearTimeout(timeout)
  }, [isSearching, search, track])

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
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
        <OpenOrdersTab tokensList={getListOpenOrders} isFetching={openOrdersFetching} isSearching={isSearching} />
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
      backgroundColor: color.bg_color_max,
    },
    container: {
      ...atoms.flex_grow,
    },
  })

  return {styles} as const
}
