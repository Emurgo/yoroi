import {catalystManagerMaker} from './manager'
import {describe} from '@jest/globals'

describe('isRegistrationOpen', () => {
  it('should return true if the registration end is not in the past', () => {
    const catalyst = catalystManagerMaker()
    const now = Date.now()
    const yesterday = now - 24 * 60 * 60 * 1000
    const yesterdayPlusAWeek = yesterday + 7 * 24 * 60 * 60 * 1000

    const fundInfo = {
      registrationStart: new Date(yesterday).toISOString(),
      registrationEnd: new Date(yesterdayPlusAWeek).toISOString(),
    }
    expect(catalyst.isRegistrationOpen(fundInfo)).toBe(true)
  })

  it('should return false if the registration end is in the past', () => {
    const catalyst = catalystManagerMaker()
    const now = Date.now()
    const yesterday = now - 24 * 60 * 60 * 1000
    const yesterdayMinusAWeek = yesterday - 7 * 24 * 60 * 60 * 1000

    const fundInfo = {
      registrationStart: new Date(yesterdayMinusAWeek).toISOString(),
      registrationEnd: new Date(yesterday).toISOString(),
    }
    expect(catalyst.isRegistrationOpen(fundInfo)).toBe(false)
  })
})
