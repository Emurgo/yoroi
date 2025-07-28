import {DappConnectorManager, useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {logger} from '~/kernel/logger/logger'
import {YoroiWallet} from '~/wallets/cardano/types'
import {walletConfig} from './wallet-config'

export const useConnectWalletToWebView = (
  wallet: YoroiWallet,
  webViewRef: React.RefObject<WebView | null>,
) => {
  const {manager, sessionId} = useDappConnector()

  const sendMessageToWebView =
    (event: string) => (id: string, result: unknown, error?: Error) => {
      if (error) {
        logger.debug('useConnectWalletToWebView: sending error to webview', {
          error,
          event,
        })
      } else {
        logger.debug('useConnectWalletToWebView: sending result to webview', {
          result,
          event,
        })
      }

      webViewRef.current?.injectJavaScript(
        getInjectableMessage({id, result, error: error?.message ?? null}),
      )
    }

  const handleWebViewEvent = async (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url

    try {
      await manager.handleEvent(data, webViewUrl, sendMessageToWebView(data))
    } catch (error) {
      logger.error('useConnectWalletToWebView: error handling web event', {
        error,
        data,
      })
    }
  }

  React.useEffect(() => {
    const initScript = getInitScript(sessionId, manager)
    webViewRef.current?.injectJavaScript(initScript)
  }, [wallet, webViewRef, sessionId, manager])

  return {
    handleEvent: handleWebViewEvent,
    initScript: getInitScript(sessionId, manager),
    sessionId,
  }
}

const getInjectableMessage = (message: unknown) => {
  const event = JSON.stringify({data: message})
  return `(() => window.dispatchEvent(new MessageEvent('message', ${event})))()`
}

const getInitScript = (
  sessionId: string,
  dappConnector: DappConnectorManager,
) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: walletConfig.iconUrl,
    apiVersion: walletConfig.apiVersion,
    walletName: walletConfig.name,
    sessionId,
  })
}
