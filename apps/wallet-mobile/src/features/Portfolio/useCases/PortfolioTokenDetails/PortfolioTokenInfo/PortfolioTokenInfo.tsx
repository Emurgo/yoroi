import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TabPanel, TabPanels} from '../../../../../components/Tabs'
import {Overview} from './Overview'
import {Performance} from './Performance'

type ActiveTab = 'performance' | 'overview' | 'transactions'

interface Props {
  activeTab: ActiveTab
}
export const PortfolioTokenInfo = ({activeTab}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
      <TabPanels>
        <TabPanel active={activeTab === 'performance'}>
          <Performance />
        </TabPanel>

        <TabPanel active={activeTab === 'overview'}>
          <Overview />
        </TabPanel>

        {/* <TabPanel active={activeTab === 'transactions'}>
          <Transactions />
        </TabPanel> */}
      </TabPanels>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.gray_cmin,
    },
  })

  return {styles} as const
}
