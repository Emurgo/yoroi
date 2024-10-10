import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {FlatList, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useBrowser} from '../../common/BrowserProvider'
import {BrowserTabsBar} from './BrowserTabsBar'
import {WebViewItem} from './WebViewItem'

export const BrowseDappScreen = () => {
  const {styles} = useStyles()
  const flatListRef = React.useRef<FlatList>(null)
  const {tabs, tabsOpen} = useBrowser()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.discoverWebViewViewed()
    }, [track]),
  )

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatListRef}
        style={styles.root}
        contentContainerStyle={styles.listContainer}
        data={tabs}
        pagingEnabled={false}
        ListHeaderComponent={() => tabsOpen && <Spacer height={16} />}
        ListFooterComponent={() => tabsOpen && <Spacer height={16} />}
        ItemSeparatorComponent={() => tabsOpen && <Spacer height={16} />}
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

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      backgroundColor: color.bg_color_max,
    },
    listContainer: {
      ...atoms.flex_grow,
    },
  })

  return {styles} as const
}
