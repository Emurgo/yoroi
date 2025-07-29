import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import Share from 'react-native-share'
import WebView from 'react-native-webview'

import {useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Icon} from '~/ui/Icon'
import {WebViewState} from './WebViewItem'

type Props = {
  webViewRef: React.RefObject<WebView>
  webViewState: WebViewState
}
export const BrowserTabBar = ({webViewRef, webViewState}: Props) => {
  const {palette: p} = useTheme()
  const {tabs, openTabs} = useBrowser()
  const insets = useSafeAreaInsets()
  const {track} = useMetrics()

  const totalTabs = Math.min(tabs.length, 99)

  const colorBackward = webViewState.canGoBack ? p.gray_800 : p.gray_500
  const colorForward = webViewState.canGoForward ? p.gray_800 : p.gray_500
  const colorRefresh = !webViewState.loading ? p.gray_800 : p.gray_500

  const handleRefresh = () => {
    if (!webViewRef.current) return
    track.discoverWebViewTabBarRefreshClicked()
    webViewRef.current.reload()
  }

  const handleBackward = () => {
    if (!webViewRef.current) return
    track.discoverWebViewTabBarBackwardClicked()
    webViewRef.current.goBack()
  }

  const handleForward = () => {
    if (!webViewRef.current) return
    track.discoverWebViewTabBarForwardClicked()
    webViewRef.current.goForward()
  }

  const handleChoseTabs = () => {
    track.discoverWebViewTabClicked()
    openTabs(true)
  }

  const handleShare = async () => {
    track.discoverWebViewTabBarShareClicked()
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
    <View
      style={[
        a.flex_row,
        a.align_center,
        a.justify_between,
        a.gap_md,
        a.px_lg,
        a.pt_md,
        {backgroundColor: p.bg_color_max},
        {
          shadowColor: '#054037',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 14,
          zIndex: 1,
          paddingBottom: insets.bottom + 12,
        },
      ]}
    >
      <Touch disabled={!webViewState.canGoBack} onPress={handleBackward}>
        <Icon.Backward color={colorBackward} />
      </Touch>

      <Touch disabled={!webViewState.canGoForward} onPress={handleForward}>
        <Icon.Forward color={colorForward} />
      </Touch>

      <Touch onPress={handleShare}>
        <Icon.Share2 color={p.gray_800} />
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

const Touch = ({
  children,
  ...props
}: React.PropsWithChildren<TouchableOpacityProps>) => {
  return <TouchableOpacity {...props}>{children}</TouchableOpacity>
}

type TabItemProps = {
  total: number
}
const TabItem = ({total = 1}: TabItemProps) => {
  const {palette: p} = useTheme()

  return (
    <View style={[{position: 'relative'}]}>
      <Icon.Square color={p.gray_800} />

      <View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}
      >
        <Text
          style={[
            {
              color: p.gray_800,
              fontWeight: '500',
              fontSize: 10,
              lineHeight: 18,
            },
          ]}
        >
          {total}
        </Text>
      </View>
    </View>
  )
}
