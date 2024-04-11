import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Dimensions, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated'
import {useSafeAreaInsets} from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import {WebViewNavigation, WebViewNavigationEvent} from 'react-native-webview/lib/WebViewTypes'

import {Icon, Spacer} from '../../../../components'
import {useConnectWalletToWebView} from '../../../DappExplorer/common/hooks'
import {useSelectedWallet} from '../../../WalletManager/Context'
import {TabItem, useBrowser} from '../../common/BrowserProvider'
import {getDomainFromUrl} from '../../common/helpers'
import {useNavigateTo} from '../../common/useNavigateTo'
import {BrowserTabBar} from './BrowserTabBar'
import {BrowserToolbar} from './BrowserToolbar'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

export type WebViewState = Partial<WebViewNavigation> & Required<Pick<WebViewNavigation, 'url'>>

type Props = {
  tab: TabItem
  index: number
}
export const WebViewItem = ({tab, index}: Props) => {
  const {styles, colors} = useStyles()
  const webViewRef = React.useRef<WebView>(null)
  const {tabs, updateTab, switchTabOpen, switchTab, setTabActive, removeTab, tabActiveIndex} = useBrowser()
  const webURL = tab?.url
  const {domainName} = getDomainFromUrl(webURL)
  const isTabActive = index === tabActiveIndex
  const navigationTo = useNavigateTo()
  const insets = useSafeAreaInsets()
  const wallet = useSelectedWallet()

  const scaleXWebview = useSharedValue(1)
  const opacityValue = useSharedValue(0)

  useConnectWalletToWebView(wallet, webViewRef)

  const containerStyleAnimated = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scaleX: scaleXWebview.value,
        },
      ],
    }
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
    updateTab(+index, {url})
  }

  const onSelectTabActive = () => {
    setTabActive(index)
    switchTab(false)
  }

  const handleCloseTab = () => {
    if (tabs.length === 1) {
      switchTab(false)
      removeTab(index)
      setTabActive(-1)
      navigationTo.discover()
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

    if (switchTabOpen) {
      scaleXWebview.value = withTiming(scaleXRatio, timingConfig)
    } else {
      scaleXWebview.value = withTiming(isTabActive ? 1 : scaleXRatio, timingConfig)
    }
  }, [isTabActive, opacityValue, scaleXWebview, switchTabOpen])

  return (
    <TouchableWithoutFeedback onPress={onSelectTabActive} disabled={!switchTabOpen}>
      <Animated.View
        style={[
          containerStyleAnimated,
          {width: SCREEN_WIDTH},
          switchTabOpen ? {height: 'auto'} : {height: isTabActive ? SCREEN_HEIGHT - insets.top : 0},
        ]}
      >
        <Animated.View
          style={
            switchTabOpen
              ? [styles.switchTabRoot, styles.roundedContainer, isTabActive && styles.switchTabRootActive]
              : styles.webViewContainer
          }
        >
          {!switchTabOpen && isTabActive && <BrowserToolbar uri={tab.url} />}

          <WebView
            ref={webViewRef}
            androidLayerType="software"
            source={{
              uri: webURL,
            }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoad={handleEventLoadWebView}
            javaScriptEnabled
            scalesPageToFit
            cacheEnabled
            style={[styles.roundedInsideContainer]}
          />

          {switchTabOpen && (
            <LinearGradient
              style={[StyleSheet.absoluteFillObject, styles.roundedInsideContainer]}
              colors={['#000000A1', '#00000000']}
            />
          )}

          {switchTabOpen && (
            <TouchableOpacity style={styles.closeTabPosition} onPress={handleCloseTab}>
              <Icon.Close size={20} color={colors.whiteStatic} />
            </TouchableOpacity>
          )}

          {!switchTabOpen && isTabActive && <BrowserTabBar webViewRef={webViewRef} webViewState={webViewStateRest} />}
        </Animated.View>

        {switchTabOpen && (
          <>
            <Spacer height={4} />

            <Text style={styles.domainText}>{domainName}</Text>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    switchTabRoot: {
      borderWidth: 2,
      borderColor: color.gray['200'],
      height: 160,
      overflow: 'hidden',
    },
    switchTabRootActive: {
      borderColor: color.primary['500'],
    },
    roundedContainer: {
      borderRadius: 8,
    },
    roundedInsideContainer: {
      borderRadius: 8 - 2,
    },
    webViewContainer: {
      height: '100%',
    },
    domainText: {
      ...typography['body-2-m-regular'],
      color: color['black-static'],
    },
    closeTabPosition: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
  })

  const colors = {
    whiteStatic: color['white-static'],
  }

  return {styles, colors} as const
}
