/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Spacer} from '../../../../components'
import {ScrollView} from '../../../../components/ScrollView/ScrollView'
import {PortfolioTokenAction} from './PortfolioTokenAction'
import {PortfolioTokenBalance} from './PortfolioTokenBalance/PortfolioTokenBalance'
import {PortfolioTokenChart} from './PortfolioTokenChart/PortfolioTokenChart'
import {PortfolioTokenInfo} from './PortfolioTokenInfo/PortfolioTokenInfo'

export const PortfolioTokenDetailsScreen = () => {
  const {styles} = useStyles()

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView nestedScrollEnabled={true} style={styles.container} bounces={false}>
        <PortfolioTokenBalance />

        <Spacer height={16} />

        <PortfolioTokenChart />

        <PortfolioTokenInfo />
      </ScrollView>

      <PortfolioTokenAction />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.pt_lg,
      backgroundColor: color.gray_cmin,
    },
    container: {
      paddingHorizontal: 16,
    },
  })

  return {styles} as const
}
