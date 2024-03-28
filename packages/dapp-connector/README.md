# Yoroi Dapp Connector Module

The Yoroi Dapp Connector package is a utility for interacting with dApps on the Cardano Blockchain.

## Installation

Install the package using npm or yarn :

```bash
npm install @yoroi/dapp-connector --save
npm install @yoroi/types --save-dev
```
```bash
yarn add @yoroi/dapp-connector --save
yarn add @yoroi/types --save-dev
```

## Usage

### Integrating a wallet with a WebView

```tsx
import {useAsyncStorage} from '@yoroi/common'
import {connectionStorageMaker, DappConnector, dappConnectorMaker} from '@yoroi/dapp-connector'

const createDappConnector = (appStorage: App.Storage) => {
  const storage = connectionStorageMaker(appStorage.join('dapp-connections/'))
  return dappConnectorMaker(storage)
}

const useDappConnector = () => {
  const appStorage = useAsyncStorage()
  return useMemo(() => createDappConnector(appStorage), [appStorage])
}

export const useConnectWalletToWebView = (
  wallet: YoroiWallet,
  webViewRef: RefObject<WebView | null>,
  sessionId: string,
) => {
  const dappConnector = useDappConnector()

  const sendMessageToWebView = (event: string) => (id: string, result: unknown, error?: Error) => {
    if (error) {
      console.log('DappConnector', 'sending error to webview', error, 'as a response to', event)
    } else {
      console.log('DappConnector', 'sending result to webview', result, 'as a response to', event)
    }

    webViewRef.current?.injectJavaScript(getInjectableMessage({id, result, error: error?.message || null}))
  }

  const handleWebViewEvent = async (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url

    const handlerWallet = {
      id: wallet.id,
      networkId: wallet.networkId,
      confirmConnection: async (origin: string) => {
        return new Promise<boolean>((resolve) => {
          Alert.alert('Confirm connection', `Do you want to connect to ${origin}?`, [
            {text: 'Cancel', style: 'cancel', onPress: () => resolve(false)},
            {text: 'OK', onPress: () => resolve(true)},
          ])
        })
      },
    }

    try {
      await dappConnector.handleEvent(data, webViewUrl, handlerWallet, sendMessageToWebView(data))
    } catch (e) {
      console.log('DappConnector', 'handleWebViewEvent::error', e)
    }
  }

  useEffect(() => {
    webViewRef.current?.injectJavaScript(getInitScript(sessionId, dappConnector))
  }, [wallet, webViewRef, sessionId, dappConnector])

  return {handleEvent: handleWebViewEvent, initScript: getInitScript(sessionId, dappConnector)}
}

const getInjectableMessage = (message: unknown) => {
  return `(() => window.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(message)}})))()`
}

const WALLET_NAME = 'wallet-name'
const API_VERSION = '1.0.0'
const ICON_URL = 'data:image/svg+xml;base64,...'

const getInitScript = (sessionId: string, dappConnector: DappConnector) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: ICON_URL,
    apiVersion: API_VERSION,
    walletName: WALLET_NAME,
    sessionId,
  })
}
```