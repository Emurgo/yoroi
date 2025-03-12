import {time} from '@yoroi/common'

import {shouldShowDRep2UsOnStakingCenter} from './should-show-drep2us-on-staking-center'

describe('shouldShowDRep2UsOnStakingCenter', () => {
  const moreThanOneMonthAgo = Date.now() - time.oneMonth - time.oneSecond
  const lessThanOneSecondAgo = Date.now() - time.oneSecond

  it.each`
    isStaking | currentDRepIdHex | yoroiDRepIdHex | dismissedAt             | expected
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${true}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${false}
  `(
    'returns $expected when isStaking is $isStaking, currentDRepId is $currentDRepId, yoroiDRep is $yoroiDRepId, and dismissedAt is $dismissedAt',
    ({isStaking, currentDRepIdHex, yoroiDRepIdHex, dismissedAt, expected}) => {
      const result = shouldShowDRep2UsOnStakingCenter({
        isStaking,
        currentDRepIdHex,
        yoroiDRepIdHex,
        dismissedAt,
      })
      expect(result).toBe(expected)
    },
  )
})
