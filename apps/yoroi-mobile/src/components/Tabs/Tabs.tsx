import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../theme'
import {Text} from '../Text'

export const Tabs = ({children}: {children: React.ReactNode}) => <View style={styles.tabs}>{children}</View>

export const Tab = ({
  onPress,
  active,
  label,
  testID,
}: {
  onPress: () => void
  active: boolean
  label: string
  testID: string
}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress} testID={testID}>
    <View style={styles.centered}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
    </View>

    {active && <View style={styles.indicator} />}
  </TouchableOpacity>
)

export const TabPanels = ({children}: {children: React.ReactNode}) => (
  <View style={styles.tabNavigatorRoot}>{children}</View>
)

export const TabPanel = ({active, children}: {active: boolean; children: React.ReactNode}) => (
  <>{active ? children : null}</>
)

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    flex: 1,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Rubik-Medium',
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
  },
  tabTextInactive: {
    color: COLORS.TEXT_INPUT,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: COLORS.PRIMARY,
  },
  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
})
