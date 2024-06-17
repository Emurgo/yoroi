import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Share from 'react-native-share'
import WebView from 'react-native-webview'

import {Icon} from '../../../../components'
import {useBrowser} from '../../common/BrowserProvider'
import {WebViewState} from './WebViewItem'

type Props = {
  webViewRef: React.RefObject<WebView>
  webViewState: WebViewState
}
export const BrowserTabBar = ({webViewRef, webViewState}: Props) => {
  const {styles, color, colors} = useStyles()
  const {tabs, openTabs} = useBrowser()
  const insets = useSafeAreaInsets()

  const totalTabs = Math.min(tabs.length, 99)

  const colorBackward = webViewState.canGoBack ? color.gray_c800 : color.gray_c500
  const colorForward = webViewState.canGoForward ? color.gray_c800 : color.gray_c500
  const colorRefresh = !webViewState.loading ? color.gray_c800 : color.gray_c500

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

  const handleChoseTabs = () => {
    openTabs(true)
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
    <View style={[styles.root, styles.shadow, {paddingBottom: insets.bottom + 12}]}>
      <Touch disabled={!webViewState.canGoBack} onPress={handleBackward}>
        <Icon.Backward color={colorBackward} />
      </Touch>

      <Touch disabled={!webViewState.canGoForward} onPress={handleForward}>
        <Icon.Forward color={colorForward} />
      </Touch>

      <Touch onPress={handleShare}>
        <Icon.Share2 color={colors.iconNormal} />
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

const Touch = ({children, ...props}: React.PropsWithChildren<TouchableOpacityProps>) => {
  return <TouchableOpacity {...props}>{children}</TouchableOpacity>
}

type TabItemProps = {
  total: number
}
const TabItem = ({total = 1}: TabItemProps) => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.tabViewContainer}>
      <Icon.Square color={colors.iconNormal} />

      <View style={styles.tabBox}>
        <Text style={styles.tabNumber}>{total}</Text>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      ...atoms.px_lg,
      paddingTop: 12,
      backgroundColor: color.gray_cmin,
    },
    shadow: {
      shadowColor: '#054037',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,

      elevation: 14,

      zIndex: 1,
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
      color: color.gray_c800,
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 18,
    },
  })

  const colors = {
    iconNormal: color.gray_c800,
  }

  return {styles, color, colors} as const
}
