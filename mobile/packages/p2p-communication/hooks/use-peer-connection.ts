import {useCallback, useEffect, useRef, useState} from 'react'

import {PeerConnection} from '../core/peer-connection'
import {ConnectionStatus} from '../types'

type UsePeerConnectionResult = {
  readonly peerId: string
  readonly status: ConnectionStatus
  readonly isReady: boolean
  readonly error: Error | null
  readonly reconnect: () => void
}

export const usePeerConnection = (
  peerConnection: PeerConnection | null,
): UsePeerConnectionResult => {
  const [peerId, setPeerId] = useState('')
  const [status, setStatus] = useState<ConnectionStatus>('initializing')
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const listenerSetupRef = useRef(false)

  const handleReconnect = useCallback(() => {
    if (!peerConnection) {
      return
    }

    if (isReady) {
      console.log('Peer connection already connected')
      return
    }

    console.log('Attempting to reconnect peer connection...')
    setStatus('initializing')
    peerConnection.reconnect()
  }, [isReady, peerConnection])

  useEffect(() => {
    if (!peerConnection) {
      return
    }

    if (listenerSetupRef.current) {
      console.log(
        'Peer connection listeners already set up, skipping duplicate setup',
      )
      return
    }

    console.log('Setting up peer connection event listeners')
    listenerSetupRef.current = true

    if (peerConnection.isReady()) {
      console.log('Peer connection already connected, syncing state')
      setPeerId(peerConnection.getPeerId())
      setStatus(peerConnection.getStatus())
      setIsReady(true)
    }

    const onOpen = (id: string): void => {
      console.log('Peer connection open event - ready for connections:', id)
      setPeerId(id)
      setStatus('ready')
      setIsReady(true)
      setError(null)
    }

    const onError = (err: Error): void => {
      console.error('Peer connection error in hook:', err)
      setError(err)
      setStatus('error')
      setIsReady(false)
    }

    const onDisconnected = (): void => {
      console.log('Peer connection disconnected from server')
      setStatus('disconnected')
      setIsReady(false)
    }

    const onClose = (): void => {
      console.log('Peer connection closed')
      setStatus('closed')
      setIsReady(false)
    }

    peerConnection.on('open', onOpen as any)

    peerConnection.on('error', onError as any)

    peerConnection.on('disconnected', onDisconnected as any)

    peerConnection.on('close', onClose as any)

    return () => {
      console.log('Cleaning up peer connection event listeners')

      peerConnection.off('open', onOpen as any)

      peerConnection.off('error', onError as any)

      peerConnection.off('disconnected', onDisconnected as any)

      peerConnection.off('close', onClose as any)

      listenerSetupRef.current = false
    }
  }, [peerConnection])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && status === 'disconnected') {
        console.log('Tab became visible, attempting reconnect')
        handleReconnect()
      }
    }

    const handleFocus = (): void => {
      handleReconnect()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [status, handleReconnect])

  return {
    peerId,
    status,
    isReady,
    error,
    reconnect: handleReconnect,
  }
}
