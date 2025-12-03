import {getLogger} from '@yoroi/common'

import {useCallback, useEffect, useState} from 'react'

import {WalletCommunication} from '../core/wallet-communication'
import {ConnectionStatus, EventCallback} from '../types'

type PeerConnectionState = {
  readonly peerId: string
  readonly isReady: boolean
}

type UseWalletConnectionResult = {
  readonly walletId: string
  readonly connected: boolean
  readonly status: ConnectionStatus
  readonly error: Error | null
  readonly disconnectWallet: () => void
  readonly setStatus: (status: ConnectionStatus) => void
}

export const useWalletConnection = (
  peerConnection: PeerConnectionState,
  walletCommunication: WalletCommunication | null,
): UseWalletConnectionResult => {
  const logger = getLogger()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {peerId: _peerId, isReady: _isReady} = peerConnection

  const [walletId, setWalletId] = useState('')
  const [connected, setConnected] = useState(
    walletCommunication?.isConnected() ?? false,
  )
  const [status, setStatus] = useState<ConnectionStatus>(
    walletCommunication?.isConnected() ? 'connected' : 'initializing',
  )
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!walletCommunication) {
      return
    }

    getLogger().log('Initializing wallet connection', {
      origin: 'p2p-communication',
      status: walletCommunication.isConnected() ? 'connected' : 'disconnected',
    })

    if (walletCommunication.isConnected()) {
      getLogger().debug('Wallet is already connected!', {
        origin: 'p2p-communication',
      })
      setConnected(true)
      setStatus('connected')
    }

    const onConnect: EventCallback<string> = (id?: string): void => {
      if (!id) return
      getLogger().log('Wallet connection established in hook', {
        origin: 'p2p-communication',
        walletId: id,
      })
      setConnected(true)
      setStatus('connected')
      setWalletId(id)
      setError(null)
    }

    const onDisconnect: EventCallback<void> = (): void => {
      getLogger().log('Wallet disconnected', {origin: 'p2p-communication'})
      setConnected(false)
      setStatus('disconnected')
    }

    const onError: EventCallback<Error> = (err?: Error): void => {
      if (!err) return
      getLogger().error(err, {
        origin: 'p2p-communication',
        operation: 'useWalletConnection',
      })
      setError(err)
      setStatus('error')
    }

    walletCommunication.on('connect', onConnect as EventCallback<unknown>)

    walletCommunication.on('disconnect', onDisconnect as EventCallback<unknown>)

    walletCommunication.on('error', onError as EventCallback<unknown>)

    return () => {
      walletCommunication.off('connect', onConnect as EventCallback<unknown>)

      walletCommunication.off(
        'disconnect',
        onDisconnect as EventCallback<unknown>,
      )

      walletCommunication.off('error', onError as EventCallback<unknown>)
    }
  }, [walletCommunication, logger])

  const disconnectWallet = useCallback(() => {
    if (!walletCommunication) {
      return
    }

    getLogger().log('Disconnecting from wallet...', {origin: 'p2p-communication'})
    if (walletCommunication.isConnected()) {
      try {
        walletCommunication.disconnect()
        setConnected(false)
        setStatus('disconnected')
        setWalletId('')
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setStatus('error')
      }
    }
  }, [walletCommunication, logger])

  return {
    walletId,
    connected,
    status,
    error,
    disconnectWallet,
    setStatus,
  }
}
