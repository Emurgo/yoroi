import {atoms as a, useTheme} from '@yoroi/theme'
import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {
  Dimensions,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import WebView from 'react-native-webview'
import {
  WebViewNavigation,
  WebViewNavigationEvent,
} from 'react-native-webview/lib/WebViewTypes'

import {TabItem, useBrowser} from '~/features/Discover/common/BrowserProvider'
import {useConnectWalletToWebView} from '~/features/Discover/common/hooks'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {getDomainFromUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
import {BrowserTabBar} from './BrowserTabBar'
import {BrowserToolbar} from './BrowserToolbar'

const SCREEN_WIDTH = Dimensions.get('window').width

export type WebViewState = Partial<WebViewNavigation> &
  Required<Pick<WebViewNavigation, 'url'>>

type Props = {
  tab: TabItem
  index: number
}
export const WebViewItem = ({tab, index}: Props) => {
  const {palette: p} = useTheme()
  const webViewRef = React.useRef<WebView>(null)
  const {
    tabs,
    updateTab,
    tabsOpen,
    openTabs,
    setTabActive,
    removeTab,
    tabActiveIndex,
  } = useBrowser()
  const webURL = tab?.url
  const {domainName} = getDomainFromUrl(webURL)
  const isTabActive = index === tabActiveIndex
  const navigationTo = useNavigateTo()
  const {wallet} = useSelectedWallet()

  const scaleXWebview = useSharedValue(1)
  const opacityValue = useSharedValue(0)

  const {initScript, handleEvent} = useConnectWalletToWebView(
    wallet,
    webViewRef,
  )

  const containerStyleAnimated = useAnimatedStyle(() => {
    return {transform: [{scaleX: scaleXWebview.value}]}
  })

  const [webViewStateRest, setWebViewState] = React.useState<WebViewState>({
    url: webURL,
    canGoBack: false,
    canGoForward: false,
    title: '',
  })

  const handleNavigationStateChange = (event: WebViewNavigation) => {
    setWebViewState(event)
  }

  const handleEventLoadWebView = (event: WebViewNavigationEvent) => {
    const url = event.nativeEvent.url
    if (url !== 'about:blank') updateTab(+index, {url})
  }

  const onSelectTabActive = () => {
    setTabActive(index)
    openTabs(false)
  }

  const handleCloseTab = () => {
    if (tabs.length === 1) {
      openTabs(false)
      removeTab(index)
      setTabActive(-1)
      navigationTo.selectDappFromList()
      return
    }

    if (index <= tabActiveIndex) {
      setTabActive(tabActiveIndex - 1)
    }

    removeTab(index)
  }

  React.useEffect(() => {
    const scaleXRatio = 1 - 16 / SCREEN_WIDTH
    const timingConfig = {duration: 100, easing: Easing.linear}

    if (tabsOpen) {
      scaleXWebview.value = withTiming(scaleXRatio, timingConfig)
    } else {
      scaleXWebview.value = withTiming(
        isTabActive ? 1 : scaleXRatio,
        timingConfig,
      )
    }
  }, [isTabActive, opacityValue, scaleXWebview, tabsOpen])

  return (
    <TouchableWithoutFeedback onPress={onSelectTabActive} disabled={!tabsOpen}>
      <Animated.View
        style={[
          containerStyleAnimated,
          {width: SCREEN_WIDTH},
          tabsOpen ? {height: 'auto'} : {height: isTabActive ? '100%' : 0},
        ]}
      >
        <Animated.View
          style={
            tabsOpen
              ? [
                  {
                    borderWidth: 2,
                    borderColor: p.gray_200,
                    height: 160,
                    overflow: 'hidden',
                    borderRadius: 8,
                  },
                  isTabActive && {borderColor: p.primary_500},
                ]
              : {height: '100%'}
          }
        >
          {!tabsOpen && isTabActive && <BrowserToolbar uri={tab.url} />}

          <WebView
            webviewDebuggingEnabled={isDev}
            originWhitelist={['*']}
            ref={webViewRef}
            androidLayerType="hardware"
            source={{uri: webURL}}
            onNavigationStateChange={handleNavigationStateChange}
            onLoad={handleEventLoadWebView}
            javaScriptEnabled
            scalesPageToFit
            cacheEnabled
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={initScript}
            onMessage={handleEvent}
            style={[{borderRadius: 6}]}
            allowsFullscreenVideo={isTabActive}
          />

          {tabsOpen && (
            <LinearGradient
              style={[
                {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
                {borderRadius: 6},
              ]}
              colors={['#000000A1', '#00000000']}
            />
          )}

          {tabsOpen && (
            <TouchableOpacity
              style={[{position: 'absolute', top: 8, right: 8}]}
              onPress={handleCloseTab}
            >
              <Icon.Close size={20} color={p.white_static} />
            </TouchableOpacity>
          )}

          {!tabsOpen && isTabActive && (
            <BrowserTabBar
              webViewRef={webViewRef}
              webViewState={webViewStateRest}
            />
          )}
        </Animated.View>

        {tabsOpen && (
          <>
            <Space.Height._2xs />

            <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
              {domainName}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}
