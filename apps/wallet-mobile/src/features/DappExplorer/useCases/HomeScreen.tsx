import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {NavigationContainer, useFocusEffect} from '@react-navigation/native'
import React, {useState} from 'react'
import {Platform, Share, StyleSheet, TouchableOpacity, View} from 'react-native'
import {WebView} from 'react-native-webview'

import {useSelectedWallet} from '../../../SelectedWallet'
import {
  NavigationArrowLeftIcon,
  NavigationArrowRightIcon,
  NavigationRefreshIcon,
  NavigationShareIcon,
} from '../common/icons'
import {useConnectWalletToWebView} from '../WebViewConnector'

// const DAPP_URL = 'https://www.jpg.store/'
// const DAPP_URL = 'https://muesliswap.com/swap'
const DAPP_URL = 'https://app.dexhunter.io/'

const ENABLED_BUTTON_COLOR = '#383E54'
const DISABLED_BUTTON_COLOR = '#8A92A3'
const Tab = createMaterialTopTabNavigator()

export const HomeScreen = () => {
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  const [tabs] = React.useState([
    {
      name: 'tab-1',
      component: TabScreen,
    },
  ])

  return (
    <View style={styles.root}>
      <NavigationContainer independent={true}>
        <Tab.Navigator>
          {tabs.map((tab) => (
            <Tab.Screen key={tab.name} name={tab.name} initialParams={{sessionId}} component={tab.component} />
          ))}
        </Tab.Navigator>
      </NavigationContainer>
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

function TabScreen({route}: {route: {params?: {sessionId?: string}}}) {
  const sessionId = route?.params?.sessionId ?? ''
  const ref = React.useRef<WebView | null>(null)
  const wallet = useSelectedWallet()
  const {handleEvent, initScript} = useConnectWalletToWebView(wallet, ref, sessionId)

  const [canGoBack, setCanGoBack] = React.useState(false)
  const [canGoForward, setCanGoForward] = React.useState(false)

  const [isFocused, setIsFocused] = useState(false)

  useFocusEffect(() => {
    ref.current?.injectJavaScript(initScript)
    setIsFocused(true)
    return () => setIsFocused(false)
  })

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

  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        {isFocused && (
          <WebView
            source={{uri: DAPP_URL}}
            ref={ref}
            injectedJavaScript={initScript}
            onMessage={handleEvent}
            id={wallet.id}
            onNavigationStateChange={(e) => {
              setCanGoBack(e.canGoBack)
              setCanGoForward(e.canGoForward)
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
