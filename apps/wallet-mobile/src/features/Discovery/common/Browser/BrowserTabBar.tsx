import {useTheme} from '@yoroi/theme'
import React, {PropsWithChildren, RefObject} from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Share from 'react-native-share'
import WebView from 'react-native-webview'

import {Icon} from '../../../../components'
import {WebViewState} from '../../useCases/Browser/BrowserView'
import {useNavigateTo} from '../useNavigateTo'
import {useBrowser} from './BrowserProvider'

type Props = {
  webViewRef: RefObject<WebView>
  webViewState: WebViewState
  onShotWebView: () => Promise<void>
}
export const BrowserTabBar = ({webViewRef, webViewState, onShotWebView}: Props) => {
  const {styles, color} = useStyles()
  const {tabs} = useBrowser()
  const navigateTo = useNavigateTo()
  const insets = useSafeAreaInsets()

  const totalTabs = Math.min(tabs.length ?? 0, 99)

  const colorBackward = webViewState.canGoBack ? color.gray['800'] : color.gray['500']
  const colorForward = webViewState.canGoForward ? color.gray['800'] : color.gray['500']
  const colorRefresh = !webViewState.loading ? color.gray['800'] : color.gray['500']

  const handleRefresh = () => {
    if (!webViewRef.current) return
    webViewRef.current.reload()
  }

  const handleBackward = () => {
    if (!webViewRef.current) return
    webViewRef.current.goBack()
  }

  const handleForward = () => {
    if (!webViewRef.current) return
    webViewRef.current.goForward()
  }

  const handleChoseTabs = async () => {
    await onShotWebView()
    navigateTo.browserTabs()
  }

  const handleShare = async () => {
    const url = webViewState.url
    const title = webViewState.title
    const message = webViewState.title

    await Share.open({
      url,
      title,
      message,
    })
  }

  return (
    <View style={[styles.root, {paddingBottom: insets.bottom + 12}]}>
      <Touch disabled={!webViewState.canGoBack} onPress={handleBackward}>
        <Icon.Backward color={colorBackward} />
      </Touch>

      <Touch disabled={!webViewState.canGoForward} onPress={handleForward}>
        <Icon.Forward color={colorForward} />
      </Touch>

      <Touch onPress={handleShare}>
        <Icon.Share2 />
      </Touch>

      <Touch onPress={handleRefresh} disabled={webViewState.loading}>
        <Icon.Reload color={colorRefresh} />
      </Touch>

      <Touch onPress={handleChoseTabs}>
        <TabItem total={totalTabs} />
      </Touch>
    </View>
  )
}

const Touch = ({children, ...props}: PropsWithChildren<TouchableOpacityProps>) => {
  const {styles} = useStyles()

  return (
    <TouchableOpacity style={styles.touchBox} {...props}>
      {children}
    </TouchableOpacity>
  )
}

type TabItemProps = {
  total: number
}
const TabItem = ({total = 1}: TabItemProps) => {
  const {styles} = useStyles()

  return (
    <View style={styles.tabViewContainer}>
      <Icon.Square />

      <View style={styles.tabBox}>
        <Text style={styles.tabNumber}>{total}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, padding} = theme

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      ...padding['x-l'],
      paddingVertical: 12,
    },
    touchBox: {
      ...padding['y-xxs'],
    },
    tabViewContainer: {
      position: 'relative',
    },
    tabBox: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabNumber: {
      color: color.gray[800],
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 18,
    },
  })

  return {styles, color} as const
}
