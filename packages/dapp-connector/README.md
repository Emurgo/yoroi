# @yoroi/dapp-connector

[![npm version](https://img.shields.io/npm/v/@yoroi/dapp-connector.svg)](https://www.npmjs.com/package/@yoroi/dapp-connector)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![codecov](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graph/badge.svg?component=dapp-connector)](https://codecov.io/gh/Emurgo/yoroi)

The Yoroi Dapp Connector package is a utility for interacting with dApps on the Cardano Blockchain.

## Development

The package is 100% covered by unit tests which need to pass before merging any changes. To run the tests, use the following command:

```bash
yarn workspace @yoroi/dapp-connector test
```
To extend the Dapp Connector API by new methods, you will need to update the `connector.js` file, which is directly inserted into the WebView.
In the same file you can already find implemented methods such as `getExtensions`, `getBalance`, or `getUtxos`.
The same methods will later need to be implemented in the `resolver.ts` file as well and a mapping needs to be added to the `methods` variable.

## DApp List

DApps in the Yoroi application are fetched from the endpoints defined in the `src/adapters/api.ts` file. Adding, changing, or removing a dApp from the list needs to be done on the server side. No new app nor package release is needed to update the list of dApps.

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
import {useSelectedWallet} from "../../useSelectedWallet";

const createDappConnector = (appStorage: App.Storage, wallet: YoroiWallet) => {
  const storage = connectionStorageMaker(appStorage.join('dapp-connections/'))
  const api: Api = {
    getDApps: async () => fetchDapps(),
  }
  return dappConnectorMaker(storage, wallet, api)
}

const useDappConnector = () => {
  const appStorage = useAsyncStorage()
  const {wallet} = useSelectedWallet()
  return useMemo(() => createDappConnector(appStorage, wallet), [appStorage])
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

## 📚 Documentation

For detailed documentation, please visit our [documentation site](https://github.com/Emurgo/yoroi/wiki).

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Build for development
npm run build:dev

# Build for release
npm run build:release
```

## 📊 Code Coverage

The package maintains a minimum code coverage threshold of 20% with a 1% threshold for status checks.

[![Code Coverage](https://codecov.io/gh/Emurgo/yoroi/branch/develop/graphs/sunburst.svg?component=dapp-connector)](https://codecov.io/gh/Emurgo/yoroi)

## 📈 Dependency Graph

Below is a visualization of the package's internal dependencies:

![Dependency Graph](./dependency-graph.svg)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/Emurgo/yoroi/blob/develop/CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](https://github.com/Emurgo/yoroi/blob/develop/LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Emurgo/yoroi/tree/develop/packages/dapp-connector)
- [Issue Tracker](https://github.com/Emurgo/yoroi/issues)