/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React, {ReactNode, startTransition, useCallback, useState} from 'react'
import {NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View} from 'react-native'

import {Tab, TabPanel, TabPanels, Tabs} from '../../../../../components/Tabs'
import {useStrings} from '../../../common/useStrings'
import {Overview} from './Overview'
import {Performance} from './Performance'
import {Transactions} from './Transactions'

type ActiveTab = 'performance' | 'overview' | 'transactions'

interface Props {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  onTabChange: () => void

  /**
   * To offset the top content when scroll to top
   */
  offsetTopContent?: ReactNode
}
export const PortfolioTokenInfo = ({onScroll, onTabChange, offsetTopContent}: Props) => {
  const {styles} = useStyles()
  const [activeTab, setActiveTab] = useState<ActiveTab>('performance')
  const strings = useStrings()

  const handleChangeTab = useCallback(
    (value: ActiveTab) =>
      startTransition(() => {
        setActiveTab(value)
        onTabChange()
      }),
    [onTabChange],
  )

  return (
    <View style={styles.root}>
      <Tabs style={styles.tabs}>
        <Tab
          style={styles.tab}
          active={activeTab === 'performance'}
          onPress={() => handleChangeTab('performance')}
          label={strings.performance}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => handleChangeTab('overview')}
          label={strings.overview}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'transactions'}
          onPress={() => handleChangeTab('transactions')}
          label={strings.transactions}
        />
      </Tabs>

      <TabPanels>
        <TabPanel active={activeTab === 'performance'}>
          <Performance onScroll={onScroll} topContent={offsetTopContent} />
        </TabPanel>

        <TabPanel active={activeTab === 'overview'}>
          <Overview onScroll={onScroll} topContent={offsetTopContent} />
        </TabPanel>

        <TabPanel active={activeTab === 'transactions'}>
          <Transactions onScroll={onScroll} topContent={offsetTopContent} />
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
      backgroundColor: color.gray_cmin,
    },
    tabs: {
      ...atoms.justify_between,
      ...atoms.px_lg,
    },
    tab: {
      flex: 0,
    },
  })

  return {styles} as const
}
