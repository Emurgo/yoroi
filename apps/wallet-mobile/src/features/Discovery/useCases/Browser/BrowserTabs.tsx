import {useTheme} from '@yoroi/theme'
import React, {useRef} from 'react'
import {FlatList, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {WebViewNavigation} from 'react-native-webview'

import {Spacer} from '../../../../components'
import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserTabItem} from '../../common/Browser/BrowserTabItem'
import {BrowserTabsBar} from '../../common/Browser/BrowserTabsBar'

export type WebViewState = Partial<WebViewNavigation> & Required<Pick<WebViewNavigation, 'url'>>

export const BrowserTabs = () => {
  const {styles} = useStyles()
  const {tabs} = useBrowser()
  const flatListRef = useRef<FlatList>(null)

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
      <FlatList
        ref={flatListRef}
        style={styles.root}
        data={tabs}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <Spacer height={16} />}
        renderItem={({item: tab, index}) => {
          return <BrowserTabItem tab={tab} index={index} />
        }}
        contentContainerStyle={styles.container}
      />

      <BrowserTabsBar />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {padding} = theme

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color['white-static'],
    },
    container: {
      ...padding['l'],
    },
  })

  return {styles} as const
}
