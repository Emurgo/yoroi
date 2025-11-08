import {useCallback, useEffect, useState} from 'react'

import {WalletCommunication} from '../core/wallet-communication'
import {ConnectionStatus} from '../types'

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

    console.log(
      'Initializing wallet connection, current status:',
      walletCommunication.isConnected() ? 'connected' : 'disconnected',
    )

    if (walletCommunication.isConnected()) {
      console.log('Wallet is already connected!')
      setConnected(true)
      setStatus('connected')
    }

    const onConnect = (id: string): void => {
      console.log('Wallet connection established in hook')
      setConnected(true)
      setStatus('connected')
      setWalletId(id)
      setError(null)
    }

    const onDisconnect = (): void => {
      console.log('Wallet disconnected')
      setConnected(false)
      setStatus('disconnected')
    }

    const onError = (err: Error): void => {
      console.error('Wallet connection error:', err)
      setError(err)
      setStatus('error')
    }

    walletCommunication.on('connect', onConnect as any)

    walletCommunication.on('disconnect', onDisconnect as any)

    walletCommunication.on('error', onError as any)

    return () => {
      walletCommunication.off('connect', onConnect as any)

      walletCommunication.off('disconnect', onDisconnect as any)

      walletCommunication.off('error', onError as any)
    }
  }, [walletCommunication])

  const disconnectWallet = useCallback(() => {
    if (!walletCommunication) {
      return
    }

    console.log('Disconnecting from wallet...')
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
  }, [walletCommunication])

  return {
    walletId,
    connected,
    status,
    error,
    disconnectWallet,
    setStatus,
  }
}
