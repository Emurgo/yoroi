import {DappConnectorManager, useDappConnector} from '@yoroi/dapp-connector'

import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {logger} from '~/kernel/logger/logger'
import {YoroiWallet} from '~/wallets/cardano/types'

import {useWalletNameOverride} from './WalletNameOverrideContext'
import {walletConfig} from './wallet-config'

export const useConnectWalletToWebView = (
  wallet: YoroiWallet,
  webViewRef: React.RefObject<WebView | null>,
  fallbackUrl?: string,
) => {
  const {manager, sessionId} = useDappConnector()
  const {walletNameOverride} = useWalletNameOverride()
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
    const initScript = getInitScript(sessionId, manager, walletNameOverride)
    webViewRef.current?.injectJavaScript(initScript)
  }, [wallet, webViewRef, sessionId, manager, walletNameOverride])

  const markWebViewReady = React.useCallback(() => {
    setIsWebViewReady(true)
  }, [])

  const sendDisconnectMessage = React.useCallback(() => {
    const disconnectMessage = getInjectableMessage({
      type: 'wallet-disconnect',
      timestamp: Date.now(),
    })
    webViewRef.current?.injectJavaScript(disconnectMessage)
  }, [webViewRef])

  return {
    handleEvent: handleWebViewEvent,
    initScript: getInitScript(sessionId, manager, walletNameOverride),
    sessionId,
    markWebViewReady,
    sendDisconnectMessage,
  }
}

/**
 * Generates JavaScript code string to inject into WebView.
 * Uses IIFE pattern to immediately execute the code when injected.
 * This is necessary because the code runs in the WebView's JavaScript context,
 * not React Native's context, so it must be self-executing.
 */
const getInjectableMessage = (message: unknown) => {
  const event = JSON.stringify({data: message})
  return `(() => window.dispatchEvent(new MessageEvent('message', ${event})))()`
}

const getInitScript = (
  sessionId: string,
  dappConnector: DappConnectorManager,
  walletNameOverride?: string | undefined,
) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: walletConfig.iconUrl,
    apiVersion: walletConfig.apiVersion,
    walletName: walletNameOverride ?? walletConfig.name,
    sessionId,
  })
}
