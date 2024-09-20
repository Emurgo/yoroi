import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {SafeArea} from '../../../../components/SafeArea'
import {ScrollView} from '../../../../components/ScrollView/ScrollView'
import {Tab, Tabs} from '../../../../components/Tabs/Tabs'
import {ReviewTxRoutes, useUnsafeParams} from '../../../../kernel/navigation'
import {Divider} from '../../common/Divider'
import {useFormattedTx} from '../../common/hooks/useFormattedTx'
import {useOnConfirm} from '../../common/hooks/useOnConfirm'
import {useStrings} from '../../common/hooks/useStrings'
import {useTxBody} from '../../common/hooks/useTxBody'
import {OverviewTab} from './Overview/OverviewTab'
import {UTxOsTab} from './UTxOs/UTxOsTab'

type Tabs = 'overview' | 'utxos'

export const ReviewTxScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const [activeTab, setActiveTab] = React.useState<Tabs>('overview')

  // TODO: move this to a context
  const params = useUnsafeParams<ReviewTxRoutes['review-tx']>()
  const {onConfirm} = useOnConfirm({
    unsignedTx: params.unsignedTx,
    onSuccess: params.onSuccess,
    onError: params.onError,
  })

  // TODO: add cbor arguments
  const txBody = useTxBody({unsignedTx: params.unsignedTx})
  const formatedTx = useFormattedTx(txBody)

  const renderTabs = React.useMemo(() => {
    return (
      <Tabs style={styles.tabs}>
        <Tab
          style={styles.tab}
          active={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
          label={strings.overviewTab}
        />

        <Tab
          style={styles.tab}
          active={activeTab === 'utxos'}
          onPress={() => setActiveTab('utxos')}
          label={strings.utxosTab}
        />
      </Tabs>
    )
  }, [activeTab, strings.overviewTab, strings.utxosTab, styles.tab, styles.tabs])

  const OverviewTabMemo = React.memo(() => <OverviewTab tx={formatedTx} />)
  const UtxosTabMemo = React.memo(() => <UTxOsTab tx={formatedTx} />)

  return (
    <KeyboardAvoidingView style={styles.root}>
      <SafeArea>
        <ScrollView bounces={false}>
          {renderTabs}

          <Divider />

          {activeTab === 'overview' && <OverviewTabMemo />}

          {activeTab === 'utxos' && <UtxosTabMemo />}
        </ScrollView>

        <Actions>
          <Button title={strings.confirm} shelleyTheme onPress={onConfirm} />
        </Actions>
      </SafeArea>
    </KeyboardAvoidingView>
  )
}

const Actions = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.actions}>{children}</View>
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    tabs: {
      ...atoms.px_lg,
      ...atoms.gap_lg,
      backgroundColor: color.bg_color_max,
    },
    tab: {
      flex: 0,
    },
    actions: {
      ...atoms.p_lg,
    },
  })

  return {styles} as const
}
