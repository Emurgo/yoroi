import {createMaterialTopTabNavigator, MaterialTopTabBarProps} from '@react-navigation/material-top-tabs'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'

import {Button} from '../../../../components/Button/Button'
import {SafeArea} from '../../../../components/SafeArea'
import {ScrollView} from '../../../../components/ScrollView/ScrollView'
import {isEmptyString} from '../../../../kernel/utils'
import {formatMetadata} from '../../common/hooks/useFormattedMetadata'
import {useFormattedTx} from '../../common/hooks/useFormattedTx'
import {useOnConfirm} from '../../common/hooks/useOnConfirm'
import {useStrings} from '../../common/hooks/useStrings'
import {useTxBody} from '../../common/hooks/useTxBody'
import {useReviewTx} from '../../common/ReviewTxProvider'
import {MetadataTab} from './Metadata/MetadataTab'
import {OverviewTab} from './Overview/OverviewTab'
import {UTxOsTab} from './UTxOs/UTxOsTab'

const MaterialTab = createMaterialTopTabNavigator()

export const ReviewTxScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {unsignedTx, operations, details, onSuccess, onError, onNotSupportedCIP1694, onCIP36SupportChange} =
    useReviewTx()

  if (unsignedTx === null) throw new Error('ReviewTxScreen: missing unsignedTx')

  const {onConfirm} = useOnConfirm({
    unsignedTx,
    onSuccess,
    onError,
    onNotSupportedCIP1694,
    onCIP36SupportChange,
  })

  // TODO: apply cbor
  const txBody = useTxBody({unsignedTx})
  const formatedTx = useFormattedTx(txBody)
  const formattedMetadata = formatMetadata(unsignedTx, txBody)

  const tabsData = [
    [strings.overviewTab, 'overview'],
    [strings.utxosTab, 'utxos'],
  ]

  if (!isEmptyString(formattedMetadata.hash) && formattedMetadata.metadata != null)
    tabsData.push([strings.metadataTab, 'metadata'])

  return (
    <SafeArea style={styles.root}>
      <MaterialTab.Navigator tabBar={(props) => <TabBar {...props} tabsData={tabsData} />}>
        <MaterialTab.Screen name="overview">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <OverviewTab tx={formatedTx} operations={operations} details={details} />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        <MaterialTab.Screen name="utxos">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <UTxOsTab tx={formatedTx} />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        <MaterialTab.Screen name="metadata">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <MetadataTab hash={formattedMetadata.hash} metadata={formattedMetadata.metadata} />
            </ScrollView>
          )}
        </MaterialTab.Screen>
      </MaterialTab.Navigator>

      <Actions>
        <Button title={strings.confirm} onPress={onConfirm} />
      </Actions>
    </SafeArea>
  )
}

const TabBar = ({navigation, state, tabsData}: MaterialTopTabBarProps & {tabsData: Array<Array<string>>}) => {
  const {styles} = useStyles()

  return (
    <FlatList
      data={tabsData}
      renderItem={({item: [label, key], index}) => (
        <Tab key={key} active={state.index === index} label={label} onPress={() => navigation.navigate(key)} />
      )}
      style={styles.tabBar}
      showsHorizontalScrollIndicator={false}
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

const Actions = ({children, style}: {children: React.ReactNode; style?: StyleProp<ViewStyle>}) => {
  const {styles} = useStyles()
  return <View style={[styles.actions, style]}>{children}</View>
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

  const colors = {
    lightGray: color.gray_200,
  }
  return {styles, colors} as const
}
