import {Platform, Share, StyleSheet, TouchableOpacity, View} from 'react-native'
import {WebView, WebViewMessageEvent} from 'react-native-webview'
import React from 'react'
import {WebViewProgressEvent} from 'react-native-webview/lib/WebViewTypes'
import {
  NavigationArrowLeftIcon,
  NavigationArrowRightIcon,
  NavigationRefreshIcon,
  NavigationShareIcon,
} from '../common/icons'
import {Logger} from '../../../yoroi-wallets/logging'

const DAPP_URL = 'https://muesliswap.com/swap'

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

  const sendDataToWebView = (id: number, result: unknown, error?: Error) => {
    console.log('sending data to webview')
    ref.current?.injectJavaScript(getInjectableJSMessage({id, result, error: error?.message || null}))
  }

  const getInjectableJSMessage = (message: unknown) => {
    return `(function() {
            window.dispatchEvent(new MessageEvent('message', {
              data: ${JSON.stringify(message)}
            }));
          })();
        `
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

  const handleMethod = async (method: string, params: unknown) => {
    if (method === 'cardano_is_enabled') {
      return false
    }

    if (method === 'log_message') {
      console.log('Log From WebView:', params)
      return true
    }

    if (method === 'cardano_enable') {
      return true
    }

    if (method === 'cardano_get_balance') {
      return '1a062ea8a0'
    }

    if (method === 'cardano_get_used_addresses') {
      return [
        '017ef00ee3672330155382a2857573868af466b88aa8c4081f45583e1784d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693',
      ]
    }

    if (method === 'cardano_get_reward_addresses') {
      return ['e184d958399bcce03402fd853d43a4e7366f2018932e5aff4eea904693']
    }

    if (method === 'cardano_get_network_id') {
      return 1
    }

    console.log('unknown method', method, params)
    throw new Error(`Unknown method ${method} with params ${JSON.stringify(params)}`)
  }

  const handleEvent = (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    try {
      const {id, method, params} = JSON.parse(data)
      handleMethod(method, params)
        .then((result) => method !== 'log_message' && sendDataToWebView(id, result))
        .catch((error) => method !== 'log_message' && sendDataToWebView(id, null, error))
    } catch (e) {
      Logger.error('DappExplorer', 'handleEvent::error', e)
    }
  }

  return (
    <View style={styles.root}>
      <WebView
        source={{uri: DAPP_URL}}
        ref={ref}
        onLoadProgress={handleLoadProgress}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={handleEvent}
      />

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
const WALLET_NAME = 'yoroi'
const API_VERSION = '0.3.0'
const ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNjMiIHZpZXdCb3g9IjAgMCA3MiA2MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExODRfODQyNDApIj4KPHBhdGggZD0iTTU1LjYyNzEgNDguOTEzNkw0OS45MjEgNTIuODcxMkw3LjkwMjMyIDIzLjg2MjNDNy45MDIzMiAyMy44MDU2IDcuOTAyMzIgMjMuNzQ4OCA3Ljg4NTYgMjMuNjkyVjIxLjEwMzdDNy44ODU2IDIwLjI2NDMgNy44ODU2IDE5LjQyNjEgNy44ODU2IDE4LjU4ODlWMTUuOTUzOUw1NS42MjcxIDQ4LjkxMzZaTTQzLjkwMDYgMTEuNDc1M0M0MS4zNjM1IDEzLjIxMTkgMzguODAyOSAxNC45MTUyIDM2LjI2NTggMTYuNjUxOUMzNi4xMzk2IDE2Ljc2NjYgMzUuOTc1MSAxNi44MzAyIDM1LjgwNDQgMTYuODMwMkMzNS42MzM4IDE2LjgzMDIgMzUuNDY5MyAxNi43NjY2IDM1LjM0MzEgMTYuNjUxOUMzMi4yMDc2IDE0LjQ3MSAyOS4wNTU0IDEyLjMxMDIgMjUuOTE2NSAxMC4xNDYxQzIyLjYxMzkgNy44NTUwMyAxOS4zMTM0IDUuNTU3MyAxNi4wMTUyIDMuMjUyODlMMTEuMzMyIDBIMEMwLjYwMTY5OSAwLjQyMDgwNSAxLjA5NjQzIDAuNzc0ODE2IDEuNTk0NSAxLjExODgxTDEwLjQ3NjMgNy4yNzA1OEMxMy40MDQ1IDkuMzA1NTkgMTYuMzMxNyAxMS4zNDA2IDE5LjI1NzcgMTMuMzc1NkMyMi4wMTIyIDE1LjI4OTMgMjQuNzU5OSAxNy4yMTI5IDI3LjUxNzcgMTkuMTIzM0MzMC4xMzUxIDIwLjkzNjcgMzIuNzU5MiAyMi43MzAyIDM1LjM3NjYgMjQuNTQ3QzM1LjQ4MjMgMjQuNjQyNyAzNS42MTk5IDI0LjY5NTggMzUuNzYyNyAyNC42OTU4QzM1LjkwNTQgMjQuNjk1OCAzNi4wNDMgMjQuNjQyNyAzNi4xNDg4IDI0LjU0N0MzOC4yNjE0IDIzLjEwMDkgNDAuMzk3NCAyMS42NzgyIDQyLjUgMjAuMjMyMUM0Ny43MzI2IDE2LjY0OTYgNTIuOTYwNyAxMy4wNjE3IDU4LjE4NDMgOS40NjgxMkw2OS42MDMyIDEuNjY5ODZDNzAuMzkyMSAxLjEzMjE3IDcxLjE3NzcgMC41ODQ0NTIgNzIgMEg2MC42MzQ2QzU1LjA1NDQgMy44MjI4NyA0OS40NzY0IDcuNjQ3OTcgNDMuOTAwNiAxMS40NzUzWk03Ljk0NTc3IDM1LjI0NzRDNy45MjA5NyAzNS4yOTU1IDcuOTAwODIgMzUuMzQ1OCA3Ljg4NTYgMzUuMzk3N1Y0MC4xNTM1QzcuODg1NiA0MS4xMDIgNy44ODU2IDQyLjA1MDUgNy44ODU2IDQyLjk5NTZDNy44ODgxNCA0My4wNTMzIDcuOTAxNzYgNDMuMTEgNy45MjU3MiA0My4xNjI2TDM1Ljk3MTYgNjIuNTMzSDM1Ljk5ODNMNDEuNzA0NCA1OC41Nzg4TDcuOTQ1NzcgMzUuMjQ3NFpNNjMuOTc0IDE1Ljk3MDZMNDMuMTAxNyAzMC4zOTE1QzQzLjE2NzYgMzAuNDgwNCA0My4yNDE1IDMwLjU2MzEgNDMuMzIyMyAzMC42Mzg2QzQ1LjA4NzMgMzEuODg3NyA0Ni44NTM0IDMzLjEzMTIgNDguNjIwNiAzNC4zNjkxQzQ4LjY3ODkgMzQuNDAwNCA0OC43NDU3IDM0LjQxMjEgNDguODExMiAzNC40MDI1TDYzLjkyMzkgMjMuOTQ5MkM2My45NDY2IDIzLjkwNDggNjMuOTYzNCAyMy44NTc2IDYzLjk3NCAyMy44MDg5VjE1Ljk3MDZaTTYzLjk5MDcgMzUuNTUxNEM2MS42MjA3IDM3LjE4NDUgNTkuMzM0MiAzOC43NjQyIDU3LjAyMSA0MC4zNjM5TDYyLjQ0MyA0NC4yMDQ2TDYzLjk5MDcgNDMuMTMyNVYzNS41NTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExODRfODQyNDApIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTg0Xzg0MjQwIiB4MT0iOS4xNTU4NiIgeTE9IjQ0LjM4NDkiIHgyPSI2Mi43NDE3IiB5Mj0iLTkuMjQ5ODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzFBNDRCNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTg0Xzg0MjQwIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjYyLjUyNjMiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=='
const SUPPORTED_EXTENSIONS = [{cip: 95}]

const INJECTED_JAVASCRIPT = `
  (() => {
    const postMessage = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data));    
    const promisesMap = new Map();
    let id = 0;
    
    const callExternalMethod = (method, params) => {
      const requestId = id; 
      id++;
      const promise = new Promise((resolve, reject) => {
        if (method !== 'log_message') {
          promisesMap.set(requestId, {resolve, reject});
        }
      });
      postMessage({id: requestId, method, params});
      return promise;
    }
    
    const serializeError = (error) => {
      if (error instanceof Error) {
        return error.name + ": " + error.message;
      }
      return JSON.stringify(error);
    };
    
    window.addEventListener('error', (event) => {
      callExternalMethod('log_message', 'Unhandled error:' + serializeError(event.error));
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      callExternalMethod('log_message', 'Unhandled rejection:' + serializeError(event.reason));
    });
    
    window.addEventListener('message', (event) => {
      callExternalMethod('log_message', 'GOT EVENT' + JSON.stringify(event.data));
      const {id, result, error} = event.data;
      const promise = promisesMap.get(id);
      if (promise) {
        promisesMap.delete(id);
        if (error) {
          callExternalMethod('log_message', 'WebView received error:' + JSON.stringify(error));
          promise.reject(error);
        } else {
          callExternalMethod('log_message', 'WebView received response:' + JSON.stringify(result));
          promise.resolve(result);
        }
      }
    });
    
    const createApi = (cardanoEnableResponse) => {
      return {
        getBalance: () => callExternalMethod('cardano_get_balance'),
        getChangeAddress: () => callExternalMethod('cardano_get_change_address'),
        getNetworkId: () => callExternalMethod('cardano_get_network_id'),
        getRewardAddresses: () => callExternalMethod('cardano_get_reward_addresses'),
        getUsedAddresses: () => callExternalMethod('cardano_get_used_addresses'),
      }
    }
    
     window.cardano = {
      ...(window.cardano || {}),
      [${JSON.stringify(WALLET_NAME)}]: Object.freeze({
        enable: () => callExternalMethod('cardano_enable').then(createApi),
        isEnabled: () => callExternalMethod('cardano_is_enabled'),
        icon: ${JSON.stringify(ICON_URL)},
        apiVersion: ${JSON.stringify(API_VERSION)},
        name: ${JSON.stringify(WALLET_NAME)},
        supportedExtensions: Object.freeze(${JSON.stringify(SUPPORTED_EXTENSIONS)}),
      }),
    };
  })();
`

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
