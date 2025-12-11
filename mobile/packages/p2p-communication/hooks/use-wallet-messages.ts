import {getLogger} from '@yoroi/logger'

import {useCallback, useEffect, useState} from 'react'

import {WALLET_METHODS} from '../constants'
import {WalletCommunication} from '../core/wallet-communication'
import {
  ConnectionStatus,
  EventCallback,
  WalletMessage,
  WalletResponse,
} from '../types'

type Message = {
  readonly from: string
  readonly text: string
  readonly time: string
}

type UseWalletMessagesResult = {
  readonly messages: ReadonlyArray<Message>
  readonly sendMessage: (text: string) => boolean
  readonly callWalletFunction: (method: string, data?: unknown) => boolean
  readonly signTransaction: (txData?: unknown) => boolean
  readonly addMessage: (from: string, text: string) => void
  readonly addSystemMessage: (text: string) => void
}

export const useWalletMessages = (
  connected: boolean,
  setStatus: (status: ConnectionStatus) => void,
  walletCommunication: WalletCommunication | null,
): UseWalletMessagesResult => {
  const [messages, setMessages] = useState<ReadonlyArray<Message>>([])

  const addMessage = useCallback((from: string, text: string): void => {
    setMessages((prev) => [
      ...prev,
      {
        from,
        text,
        time: new Date().toLocaleTimeString(),
      },
    ])
  }, [])

  const addSystemMessage = useCallback(
    (text: string): void => {
      addMessage('System', text)
    },
    [addMessage],
  )

  useEffect(() => {
    if (!walletCommunication) {
      return
    }

    const handleMessage: EventCallback<WalletMessage> = (
      data?: WalletMessage,
    ): void => {
      if (!data) return
      try {
        if (data.type === 'response') {
          const response = data as WalletResponse

          if (response.method === WALLET_METHODS.SIGN_TX) {
            if (response.error) {
              addMessage('Wallet', `Transaction REJECTED: ${response.error}`)
            } else {
              addMessage('Wallet', 'Transaction SIGNED!')
              if (response.data && typeof response.data === 'object') {
                const dataObj = response.data as Record<string, unknown>
                if (dataObj.signature) {
                  addMessage(
                    'Wallet',
                    `Signature: ${String(dataObj.signature)}`,
                  )
                }
                if (dataObj.status) {
                  addMessage('Wallet', `Status: ${String(dataObj.status)}`)
                }
              }
            }
          } else {
            addMessage(
              'Wallet',
              `${response.method}: ${JSON.stringify(response.data ?? {})}`,
            )
          }
        } else if ('message' in data && typeof data.message === 'string') {
          addMessage('Wallet', data.message)
        } else {
          addMessage('Wallet', JSON.stringify(data))
        }
      } catch (error) {
        addMessage('Wallet', String(data))
      }
    }

    walletCommunication.on('message', handleMessage as EventCallback<unknown>)

    return () => {
      walletCommunication.off(
        'message',
        handleMessage as EventCallback<unknown>,
      )
    }
  }, [walletCommunication, addMessage])

  const sendMessage = useCallback(
    (text: string): boolean => {
      if (!connected || !walletCommunication) {
        return false
      }

      const success = walletCommunication.sendMessage(text)

      if (success) {
        addMessage('dApp', text)
      }

      return success
    },
    [connected, walletCommunication, addMessage],
  )

  const callWalletFunction = useCallback(
    (method: string, data: unknown = null): boolean => {
      if (!connected || !walletCommunication) {
        return false
      }

      const success = walletCommunication.callWalletFunction(method, data)

      if (success) {
        addMessage('dApp', `Called: ${method}`)
      }

      return success
    },
    [connected, walletCommunication, addMessage],
  )

  const signTransaction = useCallback(
    (txData: unknown = null): boolean => {
      if (!connected || !walletCommunication) {
        getLogger().debug('Cannot sign tx: Not connected to wallet', {
          origin: 'p2p-communication',
        })
        return false
      }

      getLogger().log('Sending sign transaction request', {
        origin: 'p2p-communication',
      })
      const success = walletCommunication.signTransaction(txData)

      if (success) {
        addMessage('dApp', 'Requesting transaction signature...')
        setStatus('initializing')
      } else {
        getLogger().error('Failed to send transaction signing request', {
          origin: 'p2p-communication',
        })
      }

      return success
    },
    [connected, walletCommunication, addMessage, setStatus],
  )

  return {
    messages,
    sendMessage,
    callWalletFunction,
    signTransaction,
    addMessage,
    addSystemMessage,
  }
}
