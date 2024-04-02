import {useRoute} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import ViewShot, {captureRef} from 'react-native-view-shot'
import WebView, {WebViewNavigation} from 'react-native-webview'
import {WebViewNavigationEvent} from 'react-native-webview/lib/WebViewTypes'

import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserTabBar} from '../../common/Browser/BrowserTabBar'
import {BrowserToolbar} from '../../common/Browser/BrowserToolbar'

export type WebViewState = Partial<WebViewNavigation> & Required<Pick<WebViewNavigation, 'url'>>

export const BrowserView = () => {
  const {styles} = useStyles()
  const route = useRoute()
  const {name} = route
  const webViewRef = React.useRef<WebView>(null)
  const [browserId] = name.split('browser-view-').reverse()
  const {tabs, updateTab} = useBrowser()
  const currentTabIndex = tabs.findIndex((t) => t.id === browserId)
  const webURL = tabs[currentTabIndex]?.url
  const ref: React.RefObject<ViewShot> = React.useRef(null)

  const [webViewStateRest, setWebViewState] = useState<WebViewState>({
    url: webURL,
    canGoBack: false,
    canGoForward: false,
    title: '',
  })

  const handleNavigationStateChange = (event: WebViewNavigation) => {
    setWebViewState(event)
  }

  const handleShotWebView = async () => {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 0.5,
    })
    updateTab(+currentTabIndex, {captureImage: uri})
  }

  const handleEventLoadWebView = (event: WebViewNavigationEvent) => {
    const url = event.nativeEvent.url
    updateTab(+currentTabIndex, {url})
  }

  return (
    <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
      <BrowserToolbar uri={webURL} />

      <ViewShot ref={ref} style={styles.root}>
        <WebView
          ref={webViewRef}
          androidLayerType="software"
          source={{
            uri: webURL,
          }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={handleShotWebView}
          onLoad={handleEventLoadWebView}
        />
      </ViewShot>

      <BrowserTabBar webViewRef={webViewRef} webViewState={webViewStateRest} />
    </SafeAreaView>
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
