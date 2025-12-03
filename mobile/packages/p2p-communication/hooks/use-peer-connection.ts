import {getLogger} from '@yoroi/common'

import {useCallback, useEffect, useRef, useState} from 'react'

import {PeerConnection} from '../core/peer-connection'
import {ConnectionStatus, EventCallback} from '../types'

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
  const logger = getLogger()
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
      getLogger().debug('Peer connection already connected', {
        origin: 'p2p-communication',
      })
      return
    }

    getLogger().log('Attempting to reconnect peer connection...', {
      origin: 'p2p-communication',
    })
    setStatus('initializing')
    peerConnection.reconnect()
  }, [isReady, peerConnection, logger])

  useEffect(() => {
    if (!peerConnection) {
      return
    }

    if (listenerSetupRef.current) {
      getLogger().debug(
        'Peer connection listeners already set up, skipping duplicate setup',
        {origin: 'p2p-communication'},
      )
      return
    }

    getLogger().log('Setting up peer connection event listeners', {
      origin: 'p2p-communication',
    })
    listenerSetupRef.current = true

    if (peerConnection.isReady()) {
      getLogger().debug('Peer connection already connected, syncing state', {
        origin: 'p2p-communication',
      })
      setPeerId(peerConnection.getPeerId())
      setStatus(peerConnection.getStatus())
      setIsReady(true)
    }

    const onOpen: EventCallback<string> = (id?: string): void => {
      if (!id) return
      getLogger().log('Peer connection open event - ready for connections', {
        origin: 'p2p-communication',
        peerId: id,
      })
      setPeerId(id)
      setStatus('ready')
      setIsReady(true)
      setError(null)
    }

    const onError: EventCallback<Error> = (err?: Error): void => {
      if (!err) return
      getLogger().error(err, {
        origin: 'p2p-communication',
        operation: 'usePeerConnection',
      })
      setError(err)
      setStatus('error')
      setIsReady(false)
    }

    const onDisconnected: EventCallback<void> = (): void => {
      getLogger().log('Peer connection disconnected from server', {
        origin: 'p2p-communication',
      })
      setStatus('disconnected')
      setIsReady(false)
    }

    const onClose: EventCallback<void> = (): void => {
      getLogger().log('Peer connection closed', {origin: 'p2p-communication'})
      setStatus('closed')
      setIsReady(false)
    }

    peerConnection.on('open', onOpen as EventCallback)

    peerConnection.on('error', onError as EventCallback)

    peerConnection.on('disconnected', onDisconnected as EventCallback)

    peerConnection.on('close', onClose as EventCallback)

    return () => {
      getLogger().debug('Cleaning up peer connection event listeners', {
        origin: 'p2p-communication',
      })

      peerConnection.off('open', onOpen as EventCallback)

      peerConnection.off('error', onError as EventCallback)

      peerConnection.off('disconnected', onDisconnected as EventCallback)

      peerConnection.off('close', onClose as EventCallback)

      listenerSetupRef.current = false
    }
  }, [peerConnection, logger])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible' && status === 'disconnected') {
        getLogger().log('Tab became visible, attempting reconnect', {
          origin: 'p2p-communication',
        })
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
  }, [status, handleReconnect, logger])

  return {
    peerId,
    status,
    isReady,
    error,
    reconnect: handleReconnect,
  }
}
