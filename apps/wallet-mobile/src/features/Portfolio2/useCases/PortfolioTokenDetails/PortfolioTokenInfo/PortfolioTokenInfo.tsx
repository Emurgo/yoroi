/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React, {startTransition, useCallback, useState} from 'react'
import {StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../../components'
import {Tab, TabPanel, TabPanels, Tabs} from '../../../../../components/Tabs'
import {Overview} from './Overview'
import {Performance} from './Performance'
import {Transactions} from './Transactions'

type ActiveTab = 'performance' | 'overview' | 'transactions'

export const PortfolioTokenInfo = () => {
  const {styles} = useStyles()
  const [activeTab, setActiveTab] = useState<ActiveTab>('performance')

  const handleChangeTab = useCallback((value: ActiveTab) => startTransition(() => setActiveTab(value)), [])

  return (
    <View style={styles.root}>
      <Tabs style={styles.tabs}>
        <Tab
          style={styles.tab}
          active={activeTab === 'performance'}
          onPress={() => handleChangeTab('performance')}
          label="Performance"
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => handleChangeTab('overview')}
          label="Overview"
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'transactions'}
          onPress={() => handleChangeTab('transactions')}
          label="Transactions"
        />
      </Tabs>

      <Spacer height={16} />

      <TabPanels>
        <TabPanel active={activeTab === 'performance'}>
          <Performance />
        </TabPanel>

        <TabPanel active={activeTab === 'overview'}>
          <Overview />
        </TabPanel>

        <TabPanel active={activeTab === 'transactions'}>
          <Transactions />
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
      ...atoms.pt_lg,
      backgroundColor: color.gray_cmin,
    },
    tabs: {
      ...atoms.justify_between,
    },
    tab: {
      flex: 0,
    },
  })

  return {styles} as const
}
