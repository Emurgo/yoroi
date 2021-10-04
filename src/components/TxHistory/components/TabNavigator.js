// @flow

import React, {memo, useMemo, useState} from 'react'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {COLORS} from '../../../styles/config'
import {Spacer} from '../../UiKit'

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.BACKGROUND_GRAY,
  },
  centralized: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  tabPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 43,
    minWidth: 137,
    backgroundColor: COLORS.BANNER_GREY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: COLORS.LIGHT_POSITIVE_GREEN,
  },
  tabTextInactive: {
    color: COLORS.TEXT_INPUT,
  },
  indicator: {
    height: 3,
    width: '100%',
    maxWidth: 137,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  indicatorActive: {
    backgroundColor: COLORS.LIGHT_POSITIVE_GREEN,
  },
  indicatorInactive: {
    backgroundColor: 'transparent',
  },
})

const textActive = {...styles.tabText, ...styles.tabTextActive}
const textInactiveText = {...styles.tabText, ...styles.tabTextInactive}

type TabNavigatorProps = {|
  +tabs: Array<string>,
  +render: <T>(T & {|+active: number|}) => React$Node,
|}

const TabNavigator = ({tabs, render}: TabNavigatorProps) => {
  const [active, setActive] = useState<number>(0)
  const draw = useMemo(() => render({active}), [active, render])

  return (
    <View style={styles.banner}>
      <Spacer height={16} />
      <View style={styles.grid}>
        <View style={styles.row}>
          {tabs.map((label, i) => {
            const indicatorStyle = {
              ...styles.indicator,
              ...(active === i ? styles.indicatorActive : styles.indicatorInactive),
            }
            return (
              <TouchableOpacity key={`tab-navigator-${i}`} style={styles.tabPanel} onPress={() => setActive(i)}>
                <View style={styles.centralized}>
                  <Text style={textActive === label ? textActive : textInactiveText}>{label}</Text>
                </View>
                <View style={indicatorStyle} />
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
      {draw}
    </View>
  )
}

export default memo<TabNavigatorProps>(TabNavigator)
