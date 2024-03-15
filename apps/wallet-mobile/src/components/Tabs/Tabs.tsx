import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ViewProps} from 'react-native'

import {Text} from '../Text'

export const Tabs = ({children, style}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.tabs, style]}>{children}</View>
}

export const Tab = ({
  onPress,
  active,
  label,
  testID,
  style,
}: TouchableOpacityProps & {active: boolean; label: string}) => {
  const styles = useStyles()

  return (
    <TouchableOpacity style={[styles.tab, style]} onPress={onPress} testID={testID}>
      <View style={styles.centered}>
        <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>{label}</Text>
      </View>

      {active && <View style={styles.indicator} />}
    </TouchableOpacity>
  )
}

export const TabPanels = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.tabNavigatorRoot}>{children}</View>
}

export const TabPanel = ({active, children}: {active: boolean; children: React.ReactNode}) => (
  <>{active ? children : null}</>
)

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
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
      paddingVertical: 14,
      flex: 1,
    },
    tabText: {
      ...typography['body-1-l-medium'],
    },
    tabTextActive: {
      color: color.primary[600],
    },
    tabTextInactive: {
      color: color.gray[600],
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      width: '100%',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      backgroundColor: color.primary[600],
    },
    tabNavigatorRoot: {
      flex: 1,
      paddingTop: 8,
      backgroundColor: color.gray.min,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
  })

  return styles
}
