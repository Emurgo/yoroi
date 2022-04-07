import {isRegistrationOpen} from './catalystUtils'

test('Check if catalyst registration is open', () => {
  const now = Date.now()
  const yesterday = now - 24 * 60 * 60 * 1000
  const yesterdayPlusAWeek = yesterday + 7 * 24 * 60 * 60 * 1000

  const fundInfo = {
    registrationStart: new Date(yesterday).toISOString(),
    registrationEnd: new Date(yesterdayPlusAWeek).toISOString(),
  }
  expect(isRegistrationOpen(fundInfo)).toBe(true)
})
