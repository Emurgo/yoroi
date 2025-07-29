import {infoExtractName} from '@yoroi/portfolio'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {
  ILiquidityPool,
  useGetLiquidityPool,
} from '~/features/Portfolio/common/hooks/useGetLiquidityPool'
import {
  IOpenOrders,
  useGetOpenOrders,
} from '~/features/Portfolio/common/hooks/useGetOpenOrders'
import {usePortfolioPrimaryBalance} from '~/features/Portfolio/common/hooks/usePortfolioPrimaryBalance'
import {
  PortfolioDappsTab,
  usePortfolio,
} from '~/features/Portfolio/context/PortfolioProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Line} from '~/ui/Line'
import {Space} from '~/ui/Space/Space'
import {TabPanel} from '~/ui/Tabs/Tabs'
import {useSearch} from '../Search/SearchContext'
import {TotalTokensValue} from '../TotalTokensValue/TotalTokensValue'
import {LendAndBorrowTab} from './LendAndBorrowTab'
import {LiquidityPoolTab} from './LiquidityPoolTab'
import {OpenOrdersTab} from './OpenOrdersTab'
import {PortfolioDAppTabs} from './PortfolioDAppTabs'

export const PortfolioDAppsTokenList = () => {
  const {palette: p} = useTheme()
  const {search, isSearching} = useSearch()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const {dappsTab} = usePortfolio()

  const {data: liquidityPools, isFetching: liquidityPoolFetching} =
    useGetLiquidityPool()
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
    <ScrollView
      style={[a.flex_1, a.px_lg, {backgroundColor: p.bg_color_max}]}
      contentContainerStyle={[a.flex_grow]}
    >
      {!isSearching ? (
        <View>
          <TotalTokensValue amount={primaryBalance} />

          <Line />
        </View>
      ) : null}

      <Space.Height.md />

      <PortfolioDAppTabs />

      <TabPanel active={dappsTab === PortfolioDappsTab.LiquidityPool}>
        <LiquidityPoolTab
          tokensList={getListLiquidityPool}
          isFetching={liquidityPoolFetching}
          isSearching={isSearching}
        />
      </TabPanel>

      <TabPanel active={dappsTab === PortfolioDappsTab.OpenOrders}>
        <OpenOrdersTab
          tokensList={getListOpenOrders}
          isFetching={openOrdersFetching}
          isSearching={isSearching}
        />
      </TabPanel>

      <TabPanel active={dappsTab === PortfolioDappsTab.LendAndBorrow}>
        <LendAndBorrowTab />
      </TabPanel>
    </ScrollView>
  )
}
