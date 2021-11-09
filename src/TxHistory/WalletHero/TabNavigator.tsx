import React, {useState} from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import {assetMessages, txLabels} from '../../../legacy/i18n/global-messages'
import {COLORS} from '../../../legacy/styles/config'
import {Spacer} from '../../components/Spacer'

const styles = StyleSheet.create({
  root: {
    flex: 1,
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
  tabNavigatorRoot: {
    flex: 1,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  grabber: {
    display: 'flex',
    height: 4,
    width: 40,
    borderRadius: 3,
    backgroundColor: COLORS.BORDER_GRAY,
    alignSelf: 'center',
  },
})

interface TabNavigatorProps {
  render: (active: number) => JSX.Element | undefined
}

export const TabNavigator = ({render}: TabNavigatorProps) => {
  const [active, setActive] = useState<number>(0)
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        <View style={styles.row}>
          {[strings.transactions, strings.assets].map((label, i) => {
            const indicatorStyle = [styles.indicator, active === i ? styles.indicatorActive : styles.indicatorInactive]
            const textStyle = [styles.tabText, active === i ? styles.tabTextActive : styles.tabTextInactive]
            return (
              <TouchableOpacity key={`tab-navigator-${label}`} style={styles.tabPanel} onPress={() => setActive(i)}>
                <View style={styles.centralized}>
                  <Text style={textStyle}>{label}</Text>
                </View>
                <View style={indicatorStyle} />
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.tabNavigatorRoot}>
        <View style={styles.grabber} />

        <Spacer height={12} />

        {render?.(active)}
      </View>
    </View>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    transactions: intl.formatMessage(txLabels.transactions),
    assets: intl.formatMessage(assetMessages.assets),
  }
}
