import {atoms as a, useTheme} from '@yoroi/theme'
import React, {useCallback, useState} from 'react'
import {View} from 'react-native'

import {
  TokenChartInterval,
  useGetPortfolioTokenChart,
} from '~/features/Portfolio/common/hooks/useGetPortfolioTokenChart'
import {ChartPlaceholder} from './ChartPlaceholder'
import {PortfolioTokenChartSkeleton} from './PortfolioTokenChartSkeleton'
import {TokenChart} from './TokenChart'
import {TokenChartToolbar} from './TokenChartToolBar'
import {TokenPerformance} from './TokenPerformance'

export const PortfolioTokenChart = () => {
  const {atoms: ta} = useTheme()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [timeInterval, setTimeInterval] = useState<TokenChartInterval>(
    TokenChartInterval.DAY,
  )

  const {data, isFetching} = useGetPortfolioTokenChart(timeInterval)

  const handleChartSelected = useCallback((index: number) => {
    // We ignore index = -1 cause it used for hide the tooltip.
    if (index < 0) return
    setSelectedIndex(index)
  }, [])

  return (
    <View style={[a.flex_1, a.flex_col]}>
      {isFetching ? (
        <PortfolioTokenChartSkeleton />
      ) : (
        <>
          <TokenPerformance
            tokenPerformance={
              data?.[Math.max(0, Math.min(data.length - 1, selectedIndex))]
            }
            timeInterval={timeInterval}
          />

          {!data ? (
            <ChartPlaceholder />
          ) : (
            <TokenChart
              onValueSelected={handleChartSelected}
              dataSources={data}
            />
          )}
        </>
      )}

      <TokenChartToolbar
        disabled={isFetching}
        timeInterval={timeInterval}
        onChange={setTimeInterval}
      />
    </View>
  )
}
