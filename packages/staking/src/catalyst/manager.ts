import {BigNumber} from 'bignumber.js'

export const catalystManagerMaker = () => {
  return new Catalyst()
}

class Catalyst {
  isRegistrationOpen(
    fundInfo?: null | {registrationStart: string; registrationEnd: string},
  ) {
    const now = new Date()

    if (fundInfo != null) {
      const startDate = new Date(Date.parse(fundInfo.registrationStart))
      const endDate = new Date(Date.parse(fundInfo.registrationEnd))
      if (now >= startDate && now <= endDate) {
        return true
      }
      return false
    } else {
      // if we don't get fund info from server, fallback to hardcoded dates
      const rounds = CATALYST.VOTING_ROUNDS
      for (const round of rounds) {
        const startDate = new Date(Date.parse(round.START_DATE))
        const endDate = new Date(Date.parse(round.END_DATE))
        if (now >= startDate && now <= endDate) {
          return true
        }
      }
      return false
    }
  }
}

const LOVELACES_PER_ADA = new BigNumber('1 000 000'.replace(/ /g, ''), 10)

const CATALYST = {
  MIN_ADA: LOVELACES_PER_ADA.times(450),
  DISPLAYED_MIN_ADA: LOVELACES_PER_ADA.times(500),
  VOTING_ROUNDS: [
    {
      ROUND: 4,
      START_DATE: '2021-06-03T19:00:00Z',
      END_DATE: '2021-06-10T19:00:00Z',
    },
  ],
}
