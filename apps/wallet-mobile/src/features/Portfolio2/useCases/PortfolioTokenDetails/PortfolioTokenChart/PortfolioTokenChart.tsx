/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React, {useMemo, useState} from 'react'
import {StyleSheet, View} from 'react-native'

import useGetPortfolioTokenChart, {
  type TokenChartTimeInterval,
  TOKEN_CHART_TIME_INTERVAL,
} from '../../../common/useGetPortfolioTokenChart'
import {PortfolioTokenChartSkeleton} from './PortfolioTokenChartSkeleton'
import {TokenChart} from './TokenChart'
import {TokenChartToolbar} from './TokenChartToolBar'
import {TokenPerformance} from './TokenPerformance'

export const PortfolioTokenChart = () => {
  const {styles} = useStyles()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [timeInterval, setTimeInterval] = useState<TokenChartTimeInterval>(TOKEN_CHART_TIME_INTERVAL.HOUR)

  const {data, isFetching} = useGetPortfolioTokenChart(timeInterval)

  const handleChartSelected = (index: number) => {
    // We ignore index = -1 cause it used for hide the tooltip.
    if (index < 0) return
    setSelectedIndex(index)
  }

  const tokenPerformance = useMemo(() => {
    if (!data) return undefined
    if (selectedIndex < 0) return data[0]
    return data[selectedIndex]
  }, [selectedIndex, data])

  return (
    <View style={styles.chartContainer}>
      {isFetching ? (
        <PortfolioTokenChartSkeleton />
      ) : (
        <>
          <TokenPerformance
            changePercent={tokenPerformance?.changePercentage}
            value={tokenPerformance?.value}
            changeValue={tokenPerformance?.changeValue}
          />

          <TokenChart onValueSelected={handleChartSelected} dataSources={data} />
        </>
      )}

      <TokenChartToolbar timeInterval={timeInterval} onChange={setTimeInterval} />
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    chartContainer: {
      ...atoms.flex_col,
    },
  })

  return {styles} as const
}
