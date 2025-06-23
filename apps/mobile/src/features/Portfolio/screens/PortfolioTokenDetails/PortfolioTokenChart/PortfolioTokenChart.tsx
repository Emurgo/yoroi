import {useTheme} from '@yoroi/theme'
import React, {useCallback, useState} from 'react'
import {StyleSheet, View} from 'react-native'

import {TokenChartInterval, useGetPortfolioTokenChart} from '../../../common/hooks/useGetPortfolioTokenChart'
import {ChartPlaceholder} from './ChartPlaceholder'
import {PortfolioTokenChartSkeleton} from './PortfolioTokenChartSkeleton'
import {TokenChart} from './TokenChart'
import {TokenChartToolbar} from './TokenChartToolBar'
import {TokenPerformance} from './TokenPerformance'

export const PortfolioTokenChart = () => {
  const {styles} = useStyles()

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [timeInterval, setTimeInterval] = useState<TokenChartInterval>(TokenChartInterval.DAY)

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

          {!data ? <ChartPlaceholder /> : <TokenChart onValueSelected={handleChartSelected} dataSources={data} />}
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
  })

  return {styles} as const
}
