import {DappConnectorManager, useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {useModal} from '../../../components'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {Logger} from '../../../yoroi-wallets/logging'
import {ConfirmRawTxWithOs} from '../../Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '../../Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {walletConfig} from './wallet-config'
import {useStrings} from './useStrings'

export const useConnectWalletToWebView = (wallet: YoroiWallet, webViewRef: React.RefObject<WebView | null>) => {
  const {manager, sessionId} = useDappConnector()

  const sendMessageToWebView = (event: string) => (id: string, result: unknown, error?: Error) => {
    if (error) {
      Logger.info('DappConnector', 'sending error to webview', error, 'as a response to', event)
    } else {
      Logger.info('DappConnector', 'sending result to webview', result, 'as a response to', event)
    }

    webViewRef.current?.injectJavaScript(getInjectableMessage({id, result, error: error?.message ?? null}))
  }

  const handleWebViewEvent = async (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url

    try {
      await manager.handleEvent(data, webViewUrl, sendMessageToWebView(data))
    } catch (e) {
      Logger.error('DappConnector', 'handleWebViewEvent::error', e)
    }
  }

  React.useEffect(() => {
    const initScript = getInitScript(sessionId, manager)
    webViewRef.current?.injectJavaScript(initScript)
  }, [wallet, webViewRef, sessionId, manager])

  return {handleEvent: handleWebViewEvent, initScript: getInitScript(sessionId, manager), sessionId}
}

const getInjectableMessage = (message: unknown) => {
  const event = JSON.stringify({data: message})
  return `(() => window.dispatchEvent(new MessageEvent('message', ${event})))()`
}

const getInitScript = (sessionId: string, dappConnector: DappConnectorManager) => {
  return dappConnector.getWalletConnectorScript({
    iconUrl: walletConfig.iconUrl,
    apiVersion: walletConfig.apiVersion,
    walletName: walletConfig.name,
    sessionId,
  })
}

export const useConfirmRawTx = (wallet: YoroiWallet) => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const modalHeight = 350

  return ({onConfirm, onClose}: {onConfirm: (rootKey: string) => Promise<void>; onClose: () => void}) => {
    const handleOnConfirm = async (rootKey: string) => {
      const result = await onConfirm(rootKey)
      closeModal()
      return result
    }

    if (wallet.isHW) {
      throw new Error('Not implemented yet')
    }

    if (wallet.isEasyConfirmationEnabled) {
      openModal(strings.confirmTx, <ConfirmRawTxWithOs onConfirm={handleOnConfirm} />, modalHeight, onClose)
      return
    }

    openModal(strings.confirmTx, <ConfirmRawTxWithPassword onConfirm={handleOnConfirm} />, modalHeight, onClose)
  }
}
