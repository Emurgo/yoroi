import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet} from 'react-native'

import {SafeArea} from '../../../../components/SafeArea'
import {Tab, Tabs} from '../../../../components/Tabs'
import {Divider} from '../../common/Divider'
import {useFormattedTransaction} from '../../common/formattedTransaction'
import {multiAssetsOneReceiver} from '../../common/mocks'
import {OverviewTab} from './Overview/OverviewTab'

export const ReviewTransactionScreen = () => {
  const {styles} = useStyles()
  const [activeTab, setActiveTab] = React.useState('overview')
  const formatedTx = useFormattedTransaction(multiAssetsOneReceiver)

  console.log('tx', JSON.stringify(formatedTx, null, 2))

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={styles.tabs}>
        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
          label="Overview"
        />

        <Tab style={styles.tab} active={activeTab === 'utxos'} onPress={() => setActiveTab('utxos')} label="UTxOs" />
      </Tabs>
    )
  }, [activeTab, setActiveTab, styles.tab, styles.tabs])

  return (
    <SafeArea>
      {renderTabs}

      <Divider />

      {activeTab === 'overview' && <OverviewTab tx={formatedTx} />}
    </SafeArea>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    tabs: {
      ...atoms.px_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    tab: {
      flex: 0,
    },
  })

  return {styles} as const
}
