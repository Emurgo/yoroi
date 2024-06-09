import {useTheme} from '@yoroi/theme'
import React, {ReactNode} from 'react'
import {NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View} from 'react-native'

import {TabPanel, TabPanels} from '../../../../../components/Tabs'
import {Overview} from './Overview'
import {Performance} from './Performance'
import {Transactions} from './Transactions'

type ActiveTab = 'performance' | 'overview' | 'transactions'

interface Props {
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  activeTab: ActiveTab
  /**
   * To offset the top content when scroll to top
   */
  offsetTopContent?: ReactNode
}
export const PortfolioTokenInfo = ({activeTab, onScroll, offsetTopContent}: Props) => {
  const {styles} = useStyles()

  return (
    <View style={styles.root}>
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
  })

  return {styles} as const
}
