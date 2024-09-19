import {useTheme} from '@yoroi/theme'
import React, {useCallback, useState} from 'react'
import {Image, StyleSheet, View} from 'react-native'

import ChartPlaceholder from '../../../../../assets/img/chart-placeholder.png'
import {
  type TokenChartInterval,
  TOKEN_CHART_INTERVAL,
  useGetPortfolioTokenChart,
} from '../../../common/hooks/useGetPortfolioTokenChart'
import {PortfolioTokenChartSkeleton} from './PortfolioTokenChartSkeleton'
import {TokenChart} from './TokenChart'
import {TokenChartToolbar} from './TokenChartToolBar'
import {TokenPerformance} from './TokenPerformance'

export const PortfolioTokenChart = () => {
  const {styles} = useStyles()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [timeInterval, setTimeInterval] = useState<TokenChartInterval>(TOKEN_CHART_INTERVAL.DAY)

  const {data, isFetching} = useGetPortfolioTokenChart(timeInterval)

  const handleChartSelected = useCallback((index: number) => {
    // We ignore index = -1 cause it used for hide the tooltip.
    if (index < 0) return
    setSelectedIndex(index)
  }, [])

  return (
    <View style={styles.root}>
      {isFetching ? (
        <PortfolioTokenChartSkeleton />
      ) : (
        <>
          <TokenPerformance
            tokenPerformance={data?.[Math.max(0, Math.min(data.length - 1, selectedIndex))]}
            timeInterval={timeInterval}
          />

          {!data ? (
            <Image style={styles.chartUnavailable} source={ChartPlaceholder} />
          ) : (
            <TokenChart onValueSelected={handleChartSelected} dataSources={data} />
          )}
        </>
      )}

      <TokenChartToolbar disabled={isFetching} timeInterval={timeInterval} onChange={setTimeInterval} />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_col,
    },
    chartUnavailable: {
      height: 112,
      width: '100%',
      marginVertical: 16,
      resizeMode: 'stretch',
      opacity: 0.8,
    },
  })

  return {styles} as const
}
