import {time} from '@yoroi/common'

import {shouldShowDRep2UsOnStakingCenter} from './should-show-drep2us-on-staking-center'

describe('shouldShowDRep2UsOnStakingCenter', () => {
  const moreThanOneMonthAgo = Date.now() - time.oneMonth - time.oneSecond
  const lessThanOneSecondAgo = Date.now() - time.oneSecond

  it.each`
    isStaking | currentDRepIdHex | yoroiDRepIdHex | dismissedAt             | isMainnet | expected
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${true}   | ${true}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${true}   | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${false}  | ${false}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${false}  | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${false}  | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${false}  | ${false}
  `(
    'returns $expected when isStaking is $isStaking, currentDRepId is $currentDRepId, yoroiDRep is $yoroiDRepId, isMainnet is $isMainnet, and dismissedAt is $dismissedAt',
    ({
      isStaking,
      currentDRepIdHex,
      yoroiDRepIdHex,
      dismissedAt,
      isMainnet,
      expected,
    }) => {
      const result = shouldShowDRep2UsOnStakingCenter({
        isStaking,
        currentDRepIdHex,
        yoroiDRepIdHex,
        dismissedAt,
        isMainnet,
      })
      expect(result).toBe(expected)
    },
  )
})
