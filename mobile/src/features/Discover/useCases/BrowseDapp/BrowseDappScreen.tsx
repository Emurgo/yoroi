import {atoms as a, useTheme} from '@yoroi/theme'

import {useFocusEffect, useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {FlatList, View} from 'react-native'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {Space} from '~/ui/Space/Space'

import {BrowserTabsBar} from './BrowserTabsBar'
import {WebViewItem} from './WebViewItem'

export const BrowseDappScreen = () => {
  const {palette: p} = useTheme()
  const flatListRef = React.useRef<FlatList>(null)
  const {tabs, tabsOpen} = useBrowser()
  const navigation = useNavigation()

  useFocusEffect(
    React.useCallback(() => {
      const tabNav = navigation.getParent()?.getParent()
      tabNav?.setOptions({tabBarStyle: {display: 'none'}})
      return () => tabNav?.setOptions({tabBarStyle: undefined})
    }, [navigation]),
  )

  return (
    <View style={[a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <FlatList
        ref={flatListRef}
        style={[a.flex_1, {backgroundColor: p.bg_color_max}]}
        contentContainerStyle={[a.flex_grow]}
        data={tabs}
        pagingEnabled={false}
        ListHeaderComponent={() => tabsOpen && <Space.Height.md />}
        ListFooterComponent={() => tabsOpen && <Space.Height.md />}
        ItemSeparatorComponent={() => tabsOpen && <Space.Height.md />}
        keyExtractor={(item) => item.id}
        renderItem={function ({item: tab, index}) {
          return <WebViewItem tab={tab} index={index} />
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={tabsOpen ?? false}
      />

      {tabsOpen && <BrowserTabsBar />}
    </View>
  )
}
