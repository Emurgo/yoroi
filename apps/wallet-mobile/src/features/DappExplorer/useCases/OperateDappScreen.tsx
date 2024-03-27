import {useFocusEffect} from '@react-navigation/native'
import * as React from 'react'
import {Platform, Share, StyleSheet, TouchableOpacity, View} from 'react-native'
import {WebView} from 'react-native-webview'

import {TextInput} from '../../../components'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useConnectWalletToWebView} from '../common/hooks'
import {
  NavigationArrowLeftIcon,
  NavigationArrowRightIcon,
  NavigationRefreshIcon,
  NavigationShareIcon,
} from '../common/icons'
import {useTheme} from '@yoroi/theme'

const DAPP_URL = 'https://app.dexhunter.io/'

export const OperateDappScreen = () => {
  const [sessionId] = React.useState(() => Math.random().toString(36).substring(7))
  const {styles} = useStyles()
  return (
    <View style={styles.root}>
      <BrowserTab sessionId={sessionId} />
    </View>
  )
}

function BrowserTab({sessionId}: {sessionId: string}) {
  const ref = React.useRef<WebView | null>(null)
  const wallet = useSelectedWallet()
  const {handleEvent, initScript} = useConnectWalletToWebView(wallet, ref, sessionId)
  const [currentUrl, setCurrentUrl] = React.useState(DAPP_URL)
  const [inputUrl, setInputUrl] = React.useState('')

  const [canGoBack, setCanGoBack] = React.useState(false)
  const [canGoForward, setCanGoForward] = React.useState(false)

  const [isFocused, setIsFocused] = React.useState(false)

  const {styles, colors} = useStyles()

  const updateFocusedState = React.useCallback(() => {
    setIsFocused(true)
    return () => setIsFocused(false)
  }, [setIsFocused])

  const injectInitScript = React.useCallback(() => {
    ref.current?.injectJavaScript(initScript)
  }, [initScript])

  useFocusEffect(updateFocusedState)
  useFocusEffect(injectInitScript)

  const handleOnReload = () => {
    ref.current?.reload()
  }

  const handleOnNavigateBack = () => {
    ref.current?.goBack()
  }

  const handleOnNavigateForward = () => {
    ref.current?.goForward()
  }

  const handleOnShare = () => {
    if (Platform.OS === 'android') {
      Share.share({message: currentUrl})
    } else {
      Share.share({url: currentUrl})
    }
  }

  const handleOnSubmitUrl = (url: string) => {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    setCurrentUrl(normalizedUrl)
  }

  const handleOnLoaded = (url: string) => {
    setInputUrl(url)
    setCurrentUrl(url)
    ref.current?.injectJavaScript(initScript)
  }

  return (
    <View style={{flex: 1}}>
      <TextInput
        placeholder="Search"
        style={{height: 60, borderColor: 'gray', borderWidth: 1}}
        multiline={false}
        value={inputUrl}
        onChangeText={(text) => setInputUrl(text)}
        onSubmitEditing={(e) => handleOnSubmitUrl(e.nativeEvent.text)}
      />

      <View style={{flex: 1}}>
        {isFocused && (
          <WebView
            source={{uri: currentUrl}}
            ref={ref}
            injectedJavaScript={initScript}
            onMessage={handleEvent}
            id={wallet.id}
            onNavigationStateChange={(e) => {
              setCanGoBack(e.canGoBack)
              setCanGoForward(e.canGoForward)
              if (!e.loading) {
                handleOnLoaded(e.url)
              }
            }}
            nativeID={wallet.id}
            sharedCookiesEnabled={false}
            thirdPartyCookiesEnabled={false}
            key={isFocused ? 'focused' : 'blurred'}
            useSharedProcessPool={false}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
          />
        )}
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity onPress={handleOnNavigateBack} style={styles.navigationButton} disabled={!canGoBack}>
          <NavigationArrowLeftIcon color={canGoBack ? colors.enabled : colors.disabled} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOnNavigateForward} style={styles.navigationButton} disabled={!canGoForward}>
          <NavigationArrowRightIcon color={canGoForward ? colors.enabled : colors.disabled} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOnShare} style={styles.navigationButton}>
          <NavigationShareIcon color={colors.enabled} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleOnReload} style={styles.navigationButton}>
          <NavigationRefreshIcon color={colors.enabled} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
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
  const colors = {
    enabled: theme.color.gray['800'],
    disabled: theme.color.gray['500'],
  }
  return {styles, colors}
}
