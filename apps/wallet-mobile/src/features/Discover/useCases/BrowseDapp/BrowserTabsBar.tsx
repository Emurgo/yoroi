import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import uuid from 'uuid'

import {Icon} from '../../../../components'
import {useBrowser} from '../../common/BrowserProvider'
import {useNavigateTo} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'

export const BrowserTabsBar = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const navigateTo = useNavigateTo()
  const {tabs, openTabs, addTab, setTabActive} = useBrowser()
  const totalTabs = tabs.length
  const insets = useSafeAreaInsets()

  const handleCancelChangeTab = () => {
    openTabs(false)
  }

  const handleCreateTab = () => {
    openTabs(false)
    const tabId = uuid.v4()
    addTab('', tabId)
    setTabActive(tabs.length)
    navigateTo.searchDappInBrowser()
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
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    flexEnd: {
      justifyContent: 'flex-end',
    },
    fullFlex: {
      flexDirection: 'row',
      flex: 1,
    },
    root: {
      backgroundColor: color.bg_color_high,
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
      ...atoms.body_2_md_medium,
      color: color.black_static,
    },
    doneText: {
      color: color.gray_c900,
      ...atoms.body_2_md_medium,
    },
  })

  const colors = {
    iconColor: color.gray_c800,
  }

  return {styles, colors} as const
}
