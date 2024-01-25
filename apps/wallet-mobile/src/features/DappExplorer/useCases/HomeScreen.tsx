import {Platform, Share, StyleSheet, TouchableOpacity, View} from 'react-native'
import {WebView} from 'react-native-webview'
import React from 'react'
import {WebViewProgressEvent} from 'react-native-webview/lib/WebViewTypes'
import {
  NavigationArrowLeftIcon,
  NavigationArrowRightIcon,
  NavigationRefreshIcon,
  NavigationShareIcon,
} from '../common/icons'

const DAPP_URL = 'https://app.dexhunter.io/'

const ENABLED_BUTTON_COLOR = '#383E54'
const DISABLED_BUTTON_COLOR = '#8A92A3'

export const HomeScreen = () => {
  const ref = React.useRef<WebView | null>(null)
  const [canGoBack, setCanGoBack] = React.useState(false)
  const [canGoForward, setCanGoForward] = React.useState(false)

  const handleReloadPress = () => {
    ref.current?.reload()
  }

  const handleBackPress = () => {
    ref.current?.goBack()
  }

  const handleForwardPress = () => {
    ref.current?.goForward()
  }

  const handleSharePress = () => {
    if (Platform.OS === 'android') {
      Share.share({message: DAPP_URL})
    } else {
      Share.share({url: DAPP_URL})
    }
  }

  const handleLoadProgress = (e: WebViewProgressEvent) => {
    setCanGoBack(e.nativeEvent.canGoBack)
    setCanGoForward(e.nativeEvent.canGoForward)
  }

  return (
    <View style={styles.root}>
      <WebView source={{uri: DAPP_URL}} ref={ref} onLoadProgress={handleLoadProgress} />

      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handleBackPress} style={styles.navigationButton} disabled={!canGoBack}>
          <NavigationArrowLeftIcon color={canGoBack ? ENABLED_BUTTON_COLOR : DISABLED_BUTTON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForwardPress} style={styles.navigationButton} disabled={!canGoForward}>
          <NavigationArrowRightIcon color={canGoForward ? ENABLED_BUTTON_COLOR : DISABLED_BUTTON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSharePress} style={styles.navigationButton}>
          <NavigationShareIcon color={ENABLED_BUTTON_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReloadPress} style={styles.navigationButton}>
          <NavigationRefreshIcon color={ENABLED_BUTTON_COLOR} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 32,
    paddingVertical: 16,
    paddingHorizontal: 7,
  },
  navigationButton: {
    flex: 1,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
