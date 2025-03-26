import {time} from '@yoroi/common'

import {shouldShowDRep2UsOnTxHistory} from './should-show-drep2us-on-tx-history'

describe('shouldShowDRep2UsOnTxHistory', () => {
  const moreThanOneMonthAgo = Date.now() - time.oneMonth - time.oneSecond
  const lessThanOneSecondAgo = Date.now() - time.oneSecond
  const enoughBalance = 5_000_000n
  const notEnoughBalance = 4_999_999n

  it.each`
    isStaking | currentDRepIdHex | yoroiDRepIdHex | dismissedAt             | ptBalance           | isMainnet | expected
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${true}   | ${true}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${enoughBalance}    | ${true}   | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${true}   | ${false}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${notEnoughBalance} | ${true}   | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${true}   | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${false}  | ${false}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${false}  | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${enoughBalance}    | ${false}  | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${enoughBalance}    | ${false}  | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}  | ${false}
    ${false}  | ${'DE'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}  | ${false}
    ${true}   | ${'DE'}          | ${'AD'}        | ${lessThanOneSecondAgo} | ${notEnoughBalance} | ${false}  | ${false}
    ${true}   | ${'AD'}          | ${'AD'}        | ${moreThanOneMonthAgo}  | ${notEnoughBalance} | ${false}  | ${false}
  `(
    'returns $expected when isStaking is $isStaking, currentDRepId is $currentDRepId, yoroiDRep is $yoroiDRepId, ptBalance is $ptBalance, isMainnet is $isMainnet and dismissedAt is $dismissedAt',
    ({
      isStaking,
      currentDRepIdHex,
      yoroiDRepIdHex,
      dismissedAt,
      ptBalance,
      expected,
      isMainnet,
    }) => {
      const result = shouldShowDRep2UsOnTxHistory({
        isStaking,
        currentDRepIdHex,
        yoroiDRepIdHex,
        dismissedAt,
        ptBalance,
        ptMinBalance: enoughBalance,
        isMainnet,
      })
      expect(result).toBe(expected)
    },
  )
})
