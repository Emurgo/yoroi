import {DappConnectorManager, useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {logger} from '~/kernel/logger/logger'
import {YoroiWallet} from '~/wallets/cardano/types'
import {walletConfig} from './wallet-config'

export const useConnectWalletToWebView = (
  wallet: YoroiWallet,
  webViewRef: React.RefObject<WebView | null>,
  fallbackUrl?: string,
) => {
  const {manager, sessionId} = useDappConnector()
  const [isWebViewReady, setIsWebViewReady] = React.useState(false)

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
    // Skip events if WebView is not ready yet
    if (!isWebViewReady) {
      logger.debug(
        'useConnectWalletToWebView: skipping event - WebView not ready yet',
        {
          data: e.nativeEvent.data,
        },
      )
      return
    }

    const {data} = e.nativeEvent
    let webViewUrl = e.nativeEvent.url

    // Handle case where webViewUrl is null or invalid
    if (!webViewUrl || webViewUrl === 'null' || webViewUrl === 'about:blank') {
      if (fallbackUrl) {
        // Use the fallback URL from the tab data
        webViewUrl = fallbackUrl
        logger.debug('useConnectWalletToWebView: using fallback URL', {
          originalUrl: e.nativeEvent.url,
          fallbackUrl,
        })
      } else {
        // Skip this event if we don't have a valid URL
        logger.warn(
          'useConnectWalletToWebView: skipping event - no valid URL',
          {
            originalUrl: e.nativeEvent.url,
            data,
          },
        )
        return
      }
    }

    // Additional safety check: ensure we have a valid URL before proceeding
    if (!webViewUrl || webViewUrl === 'about:blank') {
      logger.warn(
        'useConnectWalletToWebView: skipping event - invalid URL after fallback',
        {
          webViewUrl,
          data,
        },
      )
      return
    }

    try {
      await manager.handleEvent(data, webViewUrl, sendMessageToWebView(data))
    } catch (error) {
      logger.error('useConnectWalletToWebView: error handling web event', {
        error,
        data,
        webViewUrl,
      })
    }
  }

  React.useEffect(() => {
    const initScript = getInitScript(sessionId, manager)
    webViewRef.current?.injectJavaScript(initScript)
  }, [wallet, webViewRef, sessionId, manager])

  const markWebViewReady = React.useCallback(() => {
    setIsWebViewReady(true)
  }, [])

  return {
    handleEvent: handleWebViewEvent,
    initScript: getInitScript(sessionId, manager),
    sessionId,
    markWebViewReady,
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
