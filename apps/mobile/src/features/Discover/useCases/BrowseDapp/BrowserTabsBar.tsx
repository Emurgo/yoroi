import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import {v4} from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useNavigateTo} from '~/features/Discover/common/useNavigateTo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'

export const BrowserTabsBar = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {tabs, openTabs, addTab, setTabActive} = useBrowser()
  const totalTabs = tabs.length
  const insets = useSafeAreaInsets()

  const handleCancelChangeTab = () => {
    openTabs(false)
  }

  const handleCreateTab = () => {
    openTabs(false)
    const tabId = v4()
    addTab('', tabId)
    setTabActive(tabs.length)
    navigateTo.searchDappInBrowser()
  }

  return (
    <View
      style={[
        styles.container,
        styles.shadow,
        {backgroundColor: p.bg_color_max, paddingBottom: insets.bottom + 12},
      ]}
    >
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleCreateTab}>
          <Icon.Plus size={24} color={p.el_gray_medium} />
        </TouchableOpacity>
      </View>

      <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
        {`${totalTabs} tab(s)`}
      </Text>

      <View style={styles.rightContainer}>
        <TouchableOpacity onPress={handleCancelChangeTab}>
          <Text style={[a.body_2_md_medium, {color: p.el_gray_medium}]}>
            {strings.discover.done}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
  leftContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
})
