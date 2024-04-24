import {DappConnector, useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {Logger} from '../../../yoroi-wallets/logging'
import {walletConfig} from './wallet-config'
import {useStakingKey} from '../../../yoroi-wallets/hooks'

export const useConnectWalletToWebView = (wallet: YoroiWallet, webViewRef: React.RefObject<WebView | null>) => {
  const sessionId = useStakingKey(wallet)
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

    try {
      await dappConnector.manager.handleEvent(data, webViewUrl, sendMessageToWebView(data))
    } catch (e) {
      Logger.error('DappConnector', 'handleWebViewEvent::error', e)
    }
  }

  React.useEffect(() => {
    const initScript = getInitScript(sessionId, dappConnector.manager)
    webViewRef.current?.injectJavaScript(initScript)
  }, [wallet, webViewRef, sessionId, dappConnector])

  return {handleEvent: handleWebViewEvent, initScript: getInitScript(sessionId, dappConnector.manager), sessionId}
}

const getInjectableMessage = (message: unknown) => {
  const event = JSON.stringify({data: message})
  return `(() => window.dispatchEvent(new MessageEvent('message', ${event})))()`
}

const getInitScript = (sessionId: string, dappConnector: DappConnector) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: walletConfig.iconUrl,
    apiVersion: walletConfig.apiVersion,
    walletName: walletConfig.name,
    sessionId,
  })
}
