import {DappConnectorManager, useDappConnector} from '@yoroi/dapp-connector'
import * as React from 'react'
import {WebView, WebViewMessageEvent} from 'react-native-webview'

import {useModal} from '../../../components/Modal/ModalContext'
import {logger} from '../../../kernel/logger/logger'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {ConfirmRawTxWithOs} from '../../Swap/common/ConfirmRawTx/ConfirmRawTxWithOs'
import {ConfirmRawTxWithPassword} from '../../Swap/common/ConfirmRawTx/ConfirmRawTxWithPassword'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useStrings} from './useStrings'
import {walletConfig} from './wallet-config'

export const useConnectWalletToWebView = (wallet: YoroiWallet, webViewRef: React.RefObject<WebView | null>) => {
  const {manager, sessionId} = useDappConnector()

  const sendMessageToWebView = (event: string) => (id: string, result: unknown, error?: Error) => {
    if (error) {
      logger.debug('useConnectWalletToWebView: sending error to webview', {error, event})
    } else {
      logger.debug('useConnectWalletToWebView: sending result to webview', {result, event})
    }

    webViewRef.current?.injectJavaScript(getInjectableMessage({id, result, error: error?.message ?? null}))
  }

  const handleWebViewEvent = async (e: WebViewMessageEvent) => {
    const {data} = e.nativeEvent
    const webViewUrl = e.nativeEvent.url

    try {
      await manager.handleEvent(data, webViewUrl, sendMessageToWebView(data))
    } catch (error) {
      logger.error('useConnectWalletToWebView: error handling web event', {error, data})
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

type PromptRootKeyOptions = {
  onConfirm: (rootKey: string) => Promise<void>
  onClose: () => void
  title?: string
  summary?: string
}

export const usePromptRootKey = () => {
  const {openModal, closeModal} = useModal()
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const modalHeight = 350

  return React.useCallback(
    ({onConfirm, onClose, title, summary}: PromptRootKeyOptions) => {
      const handleOnConfirm = async (rootKey: string) => {
        const result = await onConfirm(rootKey)
        closeModal()
        return result
      }

      if (meta.isHW) {
        throw new Error('Not implemented yet')
      }

      if (meta.isEasyConfirmationEnabled) {
        openModal(title ?? strings.confirmTx, <ConfirmRawTxWithOs onConfirm={handleOnConfirm} />, modalHeight, onClose)
        return
      }

      openModal(
        title ?? strings.confirmTx,
        <ConfirmRawTxWithPassword summary={summary} onConfirm={handleOnConfirm} />,
        modalHeight,
        onClose,
      )
    },
    [meta.isHW, meta.isEasyConfirmationEnabled, openModal, strings.confirmTx, closeModal],
  )
}
