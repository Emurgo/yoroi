import {shouldShowDrep2usOnGovernance} from './should-show-drep2us-on-governance'

describe('shouldShowDrep2usOnGovernance', () => {
  it.each`
    currentDRepIdHex | yoroiDRepIdHex | isMainnet | expected
    ${'DE'}          | ${'AD'}        | ${true}   | ${true}
    ${'AD'}          | ${'AD'}        | ${true}   | ${false}
    ${'DE'}          | ${'AD'}        | ${false}  | ${false}
    ${'AD'}          | ${'AD'}        | ${false}  | ${false}
  `(
    'should return $expected when currentDRepIdHex is $currentDRepIdHex, yoroiDRepIdHex is $yoroiDRepIdHex and isMainnet is $isMainnet',
    ({currentDRepIdHex, yoroiDRepIdHex, isMainnet, expected}) => {
      const result = shouldShowDrep2usOnGovernance({
        currentDRepIdHex,
        yoroiDRepIdHex,
        isMainnet,
      })
      expect(result).toBe(expected)
    },
  )
})
