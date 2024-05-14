import {epochProgress} from '../helpers/epoch-progress'
import {shelleyEraConfig} from '../network-manager'

describe('epochProgress', () => {
  const epochInfo = {
    epoch: 484,
    start: new Date('2024-05-09T21:44:51.000Z'),
    end: new Date('2024-05-14T21:44:51.000Z'),
    era: shelleyEraConfig,
  }

  it('should calculate epoch progress correctly last second', () => {
    const currentDate = new Date('2024-05-14T21:44:51Z')
    const progressFn = epochProgress(epochInfo)
    const result = progressFn(currentDate)

    expect(result).toEqual({
      progress: 100,
      currentSlot: 432000,
      timeRemaining: {days: 0, hours: 0, minutes: 0, seconds: 0},
    })
  })

  it('should calculate epoch progress correctly first second', () => {
    const currentDate = new Date('2024-05-09T21:44:51.000Z')
    const progressFn = epochProgress(epochInfo)
    const result = progressFn(currentDate)

    expect(result).toEqual({
      progress: 0,
      currentSlot: 0,
      timeRemaining: {days: 5, hours: 0, minutes: 0, seconds: 0},
    })
  })

  it('should calculate epoch progress correctly half way', () => {
    const currentDate = new Date('2024-05-12T09:44:51.000Z')
    const progressFn = epochProgress(epochInfo)
    const result = progressFn(currentDate)

    expect(result).toEqual({
      progress: 50,
      currentSlot: 216000,
      timeRemaining: {days: 2, hours: 12, minutes: 0, seconds: 0},
    })
  })

  it('should handle date out of the current epoch', () => {
    const currentDate = new Date('2022-01-02T00:00:01Z')
    const progressFn = epochProgress(epochInfo)

    expect(() => progressFn(currentDate)).toThrow('Date is out of the current epoch')
  })
})
