import {useAsyncStorage} from '@yoroi/common'
import {connectionStorageMaker, DappConnector, dappConnectorMaker} from '@yoroi/dapp-connector'
import {App} from '@yoroi/types'
import {RefObject, useEffect, useMemo} from 'react'
import {Alert} from 'react-native'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {Logger} from '../../../yoroi-wallets/logging'
import {WALLET_CONFIG} from './wallet-config'

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
      Logger.info('DappConnector', 'sending error to webview', error, 'as a response to', event)
    } else {
      Logger.info('DappConnector', 'sending result to webview', result, 'as a response to', event)
    }

    webViewRef.current?.injectJavaScript(getInjectableMessage({id, result, error: error?.message || null}))
  }

  const handleWebViewEvent = async (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url

    const handlerWallet = {
      id: MOCK_WALLET_ID,
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
      Logger.error('DappConnector', 'handleWebViewEvent::error', e)
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

const getInitScript = (sessionId: string, dappConnector: DappConnector) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: WALLET_CONFIG.iconUrl,
    apiVersion: WALLET_CONFIG.apiVersion,
    walletName: WALLET_CONFIG.name,
    sessionId,
  })
}

const MOCK_WALLET_ID = 'b5d94758-26c5-48b0-af2b-6e68c3ef2dbf'