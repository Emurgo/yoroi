import {createMaterialTopTabNavigator, MaterialTopTabBarProps} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {SafeArea} from '../../../../components/SafeArea'
import {ReviewTxRoutes, useUnsafeParams} from '../../../../kernel/navigation'
import {useFormattedTx} from '../../common/hooks/useFormattedTx'
import {useOnConfirm} from '../../common/hooks/useOnConfirm'
import {useStrings} from '../../common/hooks/useStrings'
import {useTxBody} from '../../common/hooks/useTxBody'
import {OverviewTab} from './Overview/OverviewTab'
import {UTxOsTab} from './UTxOs/UTxOsTab'

const MaterialTab = createMaterialTopTabNavigator()

export const ReviewTxScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()

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

  const OverViewTabMemo = React.memo(() => <OverviewTab tx={formatedTx} />)
  const UTxOsTabMemo = React.memo(() => <UTxOsTab tx={formatedTx} />)

  return (
    <SafeArea style={styles.root}>
      <MaterialTab.Navigator tabBar={TabBar}>
        <MaterialTab.Screen name="overview" component={OverViewTabMemo} />

        <MaterialTab.Screen name="utxos" component={UTxOsTabMemo} />
      </MaterialTab.Navigator>

      <Actions>
        <Button title={strings.confirm} shelleyTheme onPress={onConfirm} />
      </Actions>
    </SafeArea>
  )
}

const TabBar = ({navigation, state}: MaterialTopTabBarProps) => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <FlatList
      data={[
        [strings.overviewTab, 'overview'],
        [strings.utxosTab, 'utxos'],
      ]}
      style={styles.tabBar}
      showsHorizontalScrollIndicator={false}
      renderItem={({item: [label, key], index}) => (
        <Tab key={key} active={state.index === index} label={label} onPress={() => navigation.navigate(key)} />
      )}
      bounces={false}
      horizontal
    />
  )
}

export const Tab = ({
  onPress,
  active,
  label,
  testID,
  style,
}: TouchableOpacityProps & {active: boolean; label: string}) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={[styles.tab, style]} onPress={onPress} testID={testID}>
      <View style={styles.tabContainer}>
        <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
      </View>

      {active && <View style={styles.indicator} />}
    </TouchableOpacity>
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
    actions: {
      ...atoms.p_lg,
    },
    tabBar: {
      marginHorizontal: 16, // to include the border
      maxHeight: 50,
      borderBottomWidth: 1,
      borderBottomColor: color.gray_200,
    },
    tab: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.py_md,
    },
    tabContainer: {
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.px_lg,
    },
    tabText: {
      ...atoms.body_1_lg_medium,
    },
    tabTextActive: {
      color: color.primary_600,
    },
    tabTextInactive: {
      color: color.gray_600,
    },
    indicator: {
      ...atoms.absolute,
      bottom: 0,
      height: 2,
      width: '100%',
      backgroundColor: color.primary_500,
    },
  })

  return {styles} as const
}
