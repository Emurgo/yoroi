import {time} from '@yoroi/common'

import {shouldShowDRep2UsOnTxHistory} from './should-show-drep2us-on-tx-history'

describe('shouldShowDRep2UsOnTxHistory', () => {
  const moreThanOneMonthAgo = Date.now() - time.oneMonth - time.oneSecond
  const lessThanOneSecondAgo = Date.now() - time.oneSecond
  const enoughBalance = 5_000_000n
  const notEnoughBalance = 4_999_999n

  it.each`
    isStaking | currentDRepIdHex | yoroiDRepIdHex | dismissedAt             | ptBalance           | expected
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${true}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${enoughBalance}    | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${notEnoughBalance} | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}
  `(
    'returns $expected when isStaking is $isStaking, currentDRepId is $currentDRepId, yoroiDRep is $yoroiDRepId, ptBalance is $ptBalance, and dismissedAt is $dismissedAt',
    ({
      isStaking,
      currentDRepIdHex,
      yoroiDRepIdHex,
      dismissedAt,
      ptBalance,
      expected,
    }) => {
      const result = shouldShowDRep2UsOnTxHistory({
        isStaking,
        currentDRepIdHex,
        yoroiDRepIdHex,
        dismissedAt,
        ptBalance,
        ptMinBalance: enoughBalance,
      })
      expect(result).toBe(expected)
    },
  )
})
