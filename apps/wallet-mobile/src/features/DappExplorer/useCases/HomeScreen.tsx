import {Platform, Share, StyleSheet, TouchableOpacity, View, Text} from 'react-native'
import {WebView} from 'react-native-webview'
import React from 'react'
import {WebViewProgressEvent} from 'react-native-webview/lib/WebViewTypes'
import {
  NavigationArrowLeftIcon,
  NavigationArrowRightIcon,
  NavigationRefreshIcon,
  NavigationShareIcon,
} from '../common/icons'
import {useConnectWalletToWebView} from '../WebViewConnector'
import {useSelectedWallet} from '../../../SelectedWallet'
import {NavigationContainer} from '@react-navigation/native'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'

const DAPP_URL = 'https://muesliswap.com/swap'

const ENABLED_BUTTON_COLOR = '#383E54'
const DISABLED_BUTTON_COLOR = '#8A92A3'
const Tab = createMaterialTopTabNavigator()

export const HomeScreen = () => {
  const ref = React.useRef<WebView | null>(null)
  const [canGoBack, setCanGoBack] = React.useState(false)
  const [canGoForward, setCanGoForward] = React.useState(false)
  const wallet = useSelectedWallet()

  const [tabs, setTabs] = React.useState([
    {
      name: 'tab-1',
      component: TabScreen,
    },
    {
      name: 'tab-2',
      component: TabScreen,
    },
  ])

  const addNewTab = () => {
    setTabs((tabs) => [
      ...tabs,
      {
        name: 'tab-' + (parseInt(tabs.pop()?.name.replace('tab-', '') ?? '0') + 1),
        component: TabScreen,
      },
    ])
  }

  const remove = (route: any) => {
    setTabs((tabs) => tabs.filter((tab) => tab.name !== route.name))
  }

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
      <NavigationContainer independent={true}>
        <Tab.Navigator style={{backgroundColor: 'red'}}>
          {tabs.map((tab) => (
            <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
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

function TabScreen() {
  const ref = React.useRef<WebView | null>(null)
  const wallet = useSelectedWallet()
  const {handleEvent, initScript} = useConnectWalletToWebView(wallet, ref.current)

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
  return (
    <View style={{flex: 1}}>
      <View style={{flex: 1}}>
        <WebView
          source={{uri: DAPP_URL}}
          ref={ref}
          injectedJavaScript={initScript}
          onMessage={handleEvent}
          id={wallet.id}
          nativeID={wallet.id}
        />
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
