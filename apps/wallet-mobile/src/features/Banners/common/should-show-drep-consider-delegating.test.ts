import {time} from '../../../kernel/constants'
import {shouldShowDRepConsiderDelegating} from './should-show-drep-consider-delegating'

describe('shouldShowDRepConsiderDelegating', () => {
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
      const result = shouldShowDRepConsiderDelegating({
        isStaking,
        currentDRepIdHex,
        yoroiDRepIdHex,
        dismissedAt,
      })
      expect(result).toBe(expected)
    },
  )
})
