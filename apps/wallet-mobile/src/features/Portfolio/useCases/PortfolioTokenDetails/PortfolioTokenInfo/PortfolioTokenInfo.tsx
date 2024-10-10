import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TabPanel, TabPanels} from '../../../../../components/Tabs/Tabs'
import {PortfolioDetailsTab, usePortfolio} from '../../../common/PortfolioProvider'
import {Overview} from './Overview/Overview'
import {Performance} from './Performance'

export const PortfolioTokenInfo = () => {
  const {styles} = useStyles()
  const {detailsTab} = usePortfolio()

  return (
    <View style={styles.root}>
      <TabPanels>
        <TabPanel active={detailsTab === PortfolioDetailsTab.Performance}>
          <Performance />
        </TabPanel>

        <TabPanel active={detailsTab === PortfolioDetailsTab.Overview}>
          <Overview />
        </TabPanel>
      </TabPanels>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
  })

  return {styles} as const
}
