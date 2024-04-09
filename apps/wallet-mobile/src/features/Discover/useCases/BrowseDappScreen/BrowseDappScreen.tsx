import {useTheme} from '@yoroi/theme'
import React, {useRef} from 'react'
import {FlatList, StyleSheet, View} from 'react-native'

import {Spacer} from '../../../../components'
import {useBrowser} from '../../common/BrowserProvider'
import {BrowserTabsBar} from './BrowserTabsBar'
import {WebViewItem} from './WebViewItem'

export const BrowseDappScreen = () => {
  const {styles} = useStyles()
  const flatListRef = useRef<FlatList>(null)
  const {tabs, switchTabOpen} = useBrowser()

  return (
    <View style={styles.root}>
      <FlatList
        ref={flatListRef}
        style={styles.root}
        data={tabs}
        pagingEnabled={false}
        ListHeaderComponent={() => switchTabOpen && <Spacer height={16} />}
        ListFooterComponent={() => switchTabOpen && <Spacer height={16} />}
        ItemSeparatorComponent={() => switchTabOpen && <Spacer height={16} />}
        keyExtractor={(item) => item.id}
        renderItem={function ({item: tab, index}) {
          return <WebViewItem tab={tab} index={index} />
        }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={switchTabOpen ?? false}
      />

      {switchTabOpen && <BrowserTabsBar />}
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
  })

  return {styles} as const
}
