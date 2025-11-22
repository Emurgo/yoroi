import {init} from '@emurgo/cross-csl-nodejs'

import {
  DEFAULT_SATURATION_THRESHOLD,
  getMaybeNewEntriesByPool,
  normalisePoolIdentifierOrKey,
  TRANSITION_DATA_STUB,
} from './pool-info-api'

const mockWasmFactory = (scope: string) => init(scope)

describe('pool-info-api utilities', () => {
  describe('getMaybeNewEntriesByPool', () => {
    it('should return new entries and deadline when pool is found and enabled', () => {
      const transitionData = {
        new: {
          emurgo: ['pool1', 'pool2'],
        },
        old: {
          emurgo: [['pool123', 1234567890, true]],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toEqual({
        newEntries: ['pool1', 'pool2'],
        deadline: 1234567890,
      })
    })

    it('should return null when pool is found but disabled', () => {
      const transitionData = {
        new: {
          emurgo: ['pool1', 'pool2'],
        },
        old: {
          emurgo: [['pool123', 1234567890, false]],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toBeNull()
    })

    it('should return null when pool is not found', () => {
      const transitionData = {
        new: {
          emurgo: ['pool1', 'pool2'],
        },
        old: {
          emurgo: [['other-pool', 1234567890, true]],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toBeNull()
    })

    it('should return null when new entries are missing', () => {
      const transitionData = {
        new: {},
        old: {
          emurgo: [['pool123', 1234567890, true]],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toBeNull()
    })

    it('should search across multiple groups', () => {
      const transitionData = {
        new: {
          yoroi: ['pool3', 'pool4'],
        },
        old: {
          emurgo: [['other-pool', 1234567890, true]],
          yoroi: [['pool123', 9876543210, true]],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toEqual({
        newEntries: ['pool3', 'pool4'],
        deadline: 9876543210,
      })
    })

    it('should handle empty old entries', () => {
      const transitionData = {
        new: {
          emurgo: ['pool1'],
        },
        old: {
          emurgo: [],
        },
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toBeNull()
    })

    it('should handle missing old entries group', () => {
      const transitionData = {
        new: {
          emurgo: ['pool1'],
        },
        old: {},
      }

      const result = getMaybeNewEntriesByPool('pool123', transitionData)

      expect(result).toBeNull()
    })
  })

  describe('normalisePoolIdentifierOrKey', () => {
    it('should normalize bech32 pool ID to pool identity', async () => {
      const bech32Id = 'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y'
      const wasm = await mockWasmFactory('pool-normalize')
      const key = await wasm.Ed25519KeyHash.fromBech32(bech32Id)
      const expectedId = await key.toBech32('pool')
      const expectedHash = await key.toHex()

      const result = await normalisePoolIdentifierOrKey(bech32Id, mockWasmFactory)

      expect(result.id).toBe(expectedId)
      expect(result.hash).toBe(expectedHash.toLowerCase())
    })

    it('should normalize hex hash to pool identity', async () => {
      // First get a valid hex hash from a bech32 pool ID
      const bech32Id = 'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y'
      const wasm = await mockWasmFactory('pool-normalize')
      const key = await wasm.Ed25519KeyHash.fromBech32(bech32Id)
      const hexHash = await key.toHex()

      const result = await normalisePoolIdentifierOrKey(hexHash, mockWasmFactory)

      expect(result.id).toBe(bech32Id)
      expect(result.hash.toLowerCase()).toBe(hexHash.toLowerCase())
    })

    it('should handle different wasm scopes', async () => {
      const bech32Id = 'pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y'
      const customScope = 'custom-scope'
      const wasm = await mockWasmFactory(customScope)
      const key = await wasm.Ed25519KeyHash.fromBech32(bech32Id)
      const expectedId = await key.toBech32('pool')
      const expectedHash = await key.toHex()

      const result = await normalisePoolIdentifierOrKey(bech32Id, mockWasmFactory)

      expect(result.id).toBe(expectedId)
      expect(result.hash.toLowerCase()).toBe(expectedHash.toLowerCase())
    })
  })

  describe('constants', () => {
    it('should have correct DEFAULT_SATURATION_THRESHOLD', () => {
      expect(DEFAULT_SATURATION_THRESHOLD).toBe(0.8)
    })

    it('should have TRANSITION_DATA_STUB defined', () => {
      expect(TRANSITION_DATA_STUB).toBeDefined()
      expect(TRANSITION_DATA_STUB.new).toBeDefined()
      expect(TRANSITION_DATA_STUB.old).toBeDefined()
    })
  })
})

