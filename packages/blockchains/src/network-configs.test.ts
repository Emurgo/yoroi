import {Chain} from '@yoroi/types'

import {networkConfigs} from './network-configs'

describe('networkConfigs', () => {
  it('should define Mainnet, Preprod, and Preview configs', () => {
    expect(networkConfigs).toHaveProperty(Chain.Network.Mainnet)
    expect(networkConfigs).toHaveProperty(Chain.Network.Preprod)
    expect(networkConfigs).toHaveProperty(Chain.Network.Preview)
  })

  describe('Mainnet config', () => {
    const mainnet = networkConfigs[Chain.Network.Mainnet]

    it('should compute epoch progress without error', () => {
      const progress = mainnet.epoch.progress(
        new Date('2024-01-01T01:00:00.000Z'),
      )
      expect(progress).toEqual({
        absoluteSlot: 112504509,
        currentSlot: 11709,
        progress: 2.71,
        timeRemaining: {days: 4, hours: 20, minutes: 44, seconds: 51},
      })
    })
  })

  describe('Preprod config', () => {
    const preprod = networkConfigs[Chain.Network.Preprod]

    it('should compute epoch progress without error', () => {
      const progress = preprod.epoch.progress(
        new Date('2024-01-01T01:00:00.000Z'),
      )
      expect(progress).toEqual({
        absoluteSlot: 50025600,
        currentSlot: 345600,
        progress: 80,
        timeRemaining: {days: 1, hours: 0, minutes: 0, seconds: 0},
      })
    })
  })

  describe('Preview config', () => {
    const preview = networkConfigs[Chain.Network.Preview]

    it('should compute epoch progress without error', () => {
      const progress = preview.epoch.progress(
        new Date('2024-01-01T01:00:00.000Z'),
      )
      expect(progress).toEqual({
        absoluteSlot: 108011709,
        currentSlot: 11709,
        progress: 2.71,
        timeRemaining: {days: 4, hours: 20, minutes: 44, seconds: 51},
      })
    })
  })

  it('should be frozen (read-only)', () => {
    expect(Object.isFrozen(networkConfigs)).toBe(true)
  })
})
