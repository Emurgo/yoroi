import {useIsFocused, useRoute} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React, {useEffect, useState} from 'react'
import {Dimensions, StyleSheet} from 'react-native'
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'
import ViewShot, {captureRef} from 'react-native-view-shot'
import WebView, {WebViewNavigation} from 'react-native-webview'
import {WebViewNavigationEvent} from 'react-native-webview/lib/WebViewTypes'

import {useBrowser} from '../../common/Browser/BrowserProvider'
import {BrowserTabBar} from '../../common/Browser/BrowserTabBar'
import {BrowserToolbar} from '../../common/Browser/BrowserToolbar'

export type WebViewState = Partial<WebViewNavigation> & Required<Pick<WebViewNavigation, 'url'>>

const THUMB_WIDTH = Dimensions.get('window').width
const THUMB_HEIGHT = (THUMB_WIDTH * 339) / 160

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
  const isFocused = useIsFocused()

  const opacityValue = useSharedValue(0)
  const scaleValue = useSharedValue(0)
  const opacityAnimate = useAnimatedStyle(() => {
    return {
      opacity: opacityValue.value,
    }
  })

  const scaleAnimate = useAnimatedStyle(() => {
    return {
      transform: [{scale: scaleValue.value}],
    }
  })

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
      format: 'jpg',
      quality: 0.2,
      width: THUMB_WIDTH,
      height: THUMB_HEIGHT,
    })
    updateTab(+currentTabIndex, {captureImage: uri})
  }

  const handleEventLoadWebView = (event: WebViewNavigationEvent) => {
    const url = event.nativeEvent.url
    updateTab(+currentTabIndex, {url})
  }

  useEffect(() => {
    if (isFocused) {
      opacityValue.value = withTiming(1, {duration: 300})
      scaleValue.value = withTiming(1, {duration: 300})
    } else {
      opacityValue.value = withTiming(0, {duration: 300})
      scaleValue.value = withTiming(0, {duration: 300})
    }
  }, [isFocused, opacityValue, scaleValue])

  return (
    <Animated.View style={[opacityAnimate, styles.root]}>
      <SafeAreaView edges={['left', 'right', 'top']} style={styles.root}>
        <BrowserToolbar uri={webURL} />

        <Animated.View style={[scaleAnimate, styles.root]}>
          <ViewShot ref={ref} style={styles.root}>
            <WebView
              ref={webViewRef}
              androidLayerType="software"
              source={{
                uri: webURL,
              }}
              onNavigationStateChange={handleNavigationStateChange}
              onLoad={handleEventLoadWebView}
            />
          </ViewShot>
        </Animated.View>

        <BrowserTabBar onShotWebView={handleShotWebView} webViewRef={webViewRef} webViewState={webViewStateRest} />
      </SafeAreaView>
    </Animated.View>
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
