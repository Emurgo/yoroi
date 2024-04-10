import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {Icon} from '../../../../components'
import {useBrowser} from '../../common/BrowserProvider'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'

export const BrowserTabsBar = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const navigateTo = useNavigateTo()
  const {tabs, switchTab} = useBrowser()
  const totalTabs = tabs.length
  const insets = useSafeAreaInsets()

  const handleCancelChangeTab = () => {
    switchTab(false)
  }

  const handleCreateTab = () => {
    switchTab(false)
    navigateTo.browserSearch(false)
  }

  return (
    <View style={[styles.root, styles.shadow, {paddingBottom: insets.bottom + 12}]}>
      <View style={styles.fullFlex}>
        <TouchableOpacity onPress={handleCreateTab}>
          <Icon.Plus size={24} color={colors.iconColor} />
        </TouchableOpacity>
      </View>

      <Text style={styles.totalTabsText}>{`${totalTabs} tab(s)`}</Text>

      <View style={[styles.fullFlex, styles.flexEnd]}>
        <TouchableOpacity onPress={handleCancelChangeTab}>
          <Text style={styles.doneText}>{strings.done}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {typography, color} = theme

  const styles = StyleSheet.create({
    flexEnd: {
      justifyContent: 'flex-end',
    },
    fullFlex: {
      flexDirection: 'row',
      flex: 1,
    },
    root: {
      backgroundColor: color['white-static'],
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      justifyContent: 'space-between',
    },
    shadow: {
      shadowColor: '#054037',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,

      elevation: 14,
    },
    totalTabsText: {
      ...typography['body-2-m-medium'],
      color: color['black-static'],
    },
    doneText: {
      color: color.gray['900'],
      ...typography['body-2-m-medium'],
    },
  })

  const colors = {
    iconColor: color.gray['800'],
  }

  return {styles, colors} as const
}