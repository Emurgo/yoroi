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

import {Button} from '../../../../../components/Button/Button'
import {SafeArea} from '../../../../../components/SafeArea'
import {ScrollView} from '../../../../../components/ScrollView/ScrollView'
import {useStrings} from '../../../common/hooks/useStrings'
import {FormattedMetadata, FormattedTx} from '../../../common/types'
import {MetadataTab} from '../ReviewTx/Metadata/MetadataTab'
import {OverviewTab} from '../ReviewTx/Overview/OverviewTab'
import {UTxOsTab} from '../ReviewTx/UTxOs/UTxOsTab'

const MaterialTab = createMaterialTopTabNavigator()

export const ReviewTx = ({
  formattedTx,
  formattedMetadata,
  operations,
  details,
  receiverCustomTitle,
  onConfirm,
}: {
  formattedTx: FormattedTx
  formattedMetadata: FormattedMetadata | undefined
  operations: Array<React.ReactNode> | undefined
  details: {title: string; component: React.ReactNode} | undefined
  receiverCustomTitle: React.ReactNode | undefined
  onConfirm: () => void
}) => {
  const {styles} = useStyles()
  const strings = useStrings()

  const tabsData = [
    [strings.overviewTab, 'overview'],
    [strings.utxosTab, 'utxos'],
  ]

  return (
    <SafeArea style={styles.root}>
      <MaterialTab.Navigator tabBar={(props) => <TabBar {...props} tabsData={tabsData} />}>
        <MaterialTab.Screen name="overview">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <OverviewTab
                tx={formattedTx}
                extraOperations={operations}
                details={details}
                receiverCustomTitle={receiverCustomTitle}
              />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        <MaterialTab.Screen name="utxos">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <UTxOsTab tx={formattedTx} />
            </ScrollView>
          )}
        </MaterialTab.Screen>

        <MaterialTab.Screen name="metadata">
          {() => (
            /* TODO: make scrollview general to use button border */
            <ScrollView style={styles.root}>
              <MetadataTab hash={formattedMetadata?.hash ?? null} metadata={formattedMetadata?.metadata ?? null} />
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
