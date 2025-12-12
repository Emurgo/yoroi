import {BaseStorage} from '@yoroi/types'

import {WebRTCAdapter} from '../types'
import {connectionManagerMaker} from './connection-manager'

describe('connectionManagerMaker', () => {
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

  it('should create a connection manager', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const manager = connectionManagerMaker({storage, webrtcAdapter})

    expect(manager).toBeDefined()
    expect(manager.initialize).toBeDefined()
    expect(manager.cleanup).toBeDefined()
    expect(manager.getPeerConnection).toBeDefined()
    expect(manager.getWalletCommunication).toBeDefined()
    expect(manager.isInitialized).toBeDefined()
  })

  it('should start uninitialized', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const manager = connectionManagerMaker({storage, webrtcAdapter})

    expect(manager.isInitialized()).toBe(false)
    expect(manager.getPeerConnection()).toBeNull()
    expect(manager.getWalletCommunication()).toBeNull()
  })

  it('should cleanup without errors when not initialized', () => {
    const storage = createMockStorage()
    const webrtcAdapter = createMockWebRTCAdapter()
    const manager = connectionManagerMaker({storage, webrtcAdapter})

    expect(() => manager.cleanup()).not.toThrow()
  })
})
