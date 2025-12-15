import {BaseStorage} from '@yoroi/types'

import {WebRTCAdapter} from '../types'
import {peerConnectionMaker} from './peer-connection'
import {walletCommunicationMaker} from './wallet-communication'

describe('walletCommunicationMaker', () => {
  const createMockStorage = (): BaseStorage => {
    const storage: Record<string, string> = {}

    return {
      getItem: async (key: string): Promise<string | null> => {
        return storage[key] ?? null
      },
      setItem: async (key: string, value: string): Promise<void> => {
        storage[key] = value
      },
      removeItem: async (key: string): Promise<void> => {
        delete storage[key]
      },
    }
  }

  const createMockWebRTCAdapter = (): WebRTCAdapter => {
    // Mock WebRTC adapter for testing
    return {
      RTCPeerConnection: class {
        constructor() {}
      } as unknown as new (
        configuration?: RTCConfiguration,
      ) => RTCPeerConnection,
      RTCSessionDescription: class {
        constructor() {}
      } as unknown as new (
        descriptionInitDict?: RTCSessionDescriptionInit,
      ) => RTCSessionDescription,
      RTCIceCandidate: class {
        constructor() {}
      } as unknown as new (
        candidateInitDict?: RTCIceCandidateInit,
      ) => RTCIceCandidate,
    }
  }

  it('should create wallet communication', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const peerConnection = peerConnectionMaker({storage, webrtcAdapter})
    const walletCommunication = walletCommunicationMaker({peerConnection})

    expect(walletCommunication).toBeDefined()
    expect(walletCommunication.sendMessage).toBeDefined()
    expect(walletCommunication.callWalletFunction).toBeDefined()
    expect(walletCommunication.signTransaction).toBeDefined()
    expect(walletCommunication.disconnect).toBeDefined()
    expect(walletCommunication.on).toBeDefined()
    expect(walletCommunication.off).toBeDefined()
    expect(walletCommunication.isConnected).toBeDefined()
  })

  it('should start disconnected', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const peerConnection = peerConnectionMaker({storage, webrtcAdapter})
    const walletCommunication = walletCommunicationMaker({peerConnection})

    expect(walletCommunication.isConnected()).toBe(false)
  })

  it('should handle event listeners', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const peerConnection = peerConnectionMaker({storage, webrtcAdapter})
    const walletCommunication = walletCommunicationMaker({peerConnection})

    const connectCallback = jest.fn()
    walletCommunication.on('connect', connectCallback)

    // Remove listener
    walletCommunication.off('connect', connectCallback)

    expect(connectCallback).not.toHaveBeenCalled()
  })
})
