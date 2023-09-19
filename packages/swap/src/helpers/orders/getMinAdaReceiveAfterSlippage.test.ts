import {asQuantity} from '../../utils/asQuantity'
import {getMinAdaReceiveAfterSlippage} from './getMinAdaReceiveAfterSlippage'

const mocknumberLocale = {
  decimalSeparator: '.',
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  groupSeparator: ',',
  groupSize: 3,
  prefix: '',
  secondaryGroupSize: 0,
  suffix: '',
}

describe('getMinAdaReceiveAfterSlippage', () => {
  it('should calculate the correct minimum ADA received after applying slippage', () => {
    expect(
      getMinAdaReceiveAfterSlippage(
        asQuantity(1000),
        0.03,
        2,
        mocknumberLocale,
      ),
    ).toBe('9.9')
    expect(
      getMinAdaReceiveAfterSlippage(asQuantity(500), 1, 2, mocknumberLocale),
    ).toBe('4.9')
    expect(
      getMinAdaReceiveAfterSlippage(asQuantity(1000), 2, 2, mocknumberLocale),
    ).toBe('9.8')
  })

  it('should return the original amount when slippage is zero', () => {
    expect(
      getMinAdaReceiveAfterSlippage(asQuantity(1000), 0, 2, mocknumberLocale),
    ).toBe('1')
  })

  it('should return zero when the output amount is zero', () => {
    expect(
      getMinAdaReceiveAfterSlippage(asQuantity(0), 5, 2, mocknumberLocale),
    ).toBe('')
  })
})
