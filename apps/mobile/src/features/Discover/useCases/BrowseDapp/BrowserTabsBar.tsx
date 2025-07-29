import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import uuid from 'uuid'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useNavigateTo} from '~/features/Discover/common/useNavigateTo'
import {Icon} from '~/ui/Icon'
import {useStrings} from '../../common/useStrings'

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
    const tabId = uuid.v4()
    addTab('', tabId)
    setTabActive(tabs.length)
    navigateTo.searchDappInBrowser()
  }

  return (
    <View
      style={[
        {
          backgroundColor: p.bg_color_max,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          justifyContent: 'space-between',
        },
        {
          shadowColor: '#054037',
          shadowOffset: {
            width: 0,
            height: 5,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 14,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <View style={[{flexDirection: 'row', flex: 1}]}>
        <TouchableOpacity onPress={handleCreateTab}>
          <Icon.Plus size={24} color={p.el_gray_medium} />
        </TouchableOpacity>
      </View>

      <Text style={[a.body_2_md_medium, {color: p.text_gray_medium}]}>
        {`${totalTabs} tab(s)`}
      </Text>

      <View
        style={[{flexDirection: 'row', flex: 1, justifyContent: 'flex-end'}]}
      >
        <TouchableOpacity onPress={handleCancelChangeTab}>
          <Text style={[a.body_2_md_medium, {color: p.el_gray_medium}]}>
            {strings.done}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
