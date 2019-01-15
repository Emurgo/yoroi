// @flow
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'

// 1 ADA = 1 000 000 micro ada
const MICRO = 1000000

export class InvalidAdaAmount extends ExtendableError {
  static ERROR_CODES = {
    INVALID_AMOUNT: 'INVALID_AMOUNT', // general parsing problem or amount is equal to 0
    TOO_MANY_DECIMAL_PLACES: 'TOO_MANY_DECIMAL_PLACES',
    TOO_LARGE: 'TOO_LARGE',
    NEGATIVE: 'NEGATIVE',
  }

  constructor(errorCode: $Values<typeof InvalidAdaAmount.ERROR_CODES>) {
    super('InvalidAdaAmount')
    this.errorCode = errorCode
  }
}

// Maximum ADA supply in microADA
const MAX_ADA = new BigNumber('45 000 000 000 000000'.replace(/ /g, ''), 10)

export const parseAdaDecimal = (amount: string) => {
  const parsed = new BigNumber(amount, 10)
  if (parsed.isNaN()) {
    throw new InvalidAdaAmount(InvalidAdaAmount.ERROR_CODES.INVALID_AMOUNT)
  }

  if (parsed.decimalPlaces() > 6) {
    throw new InvalidAdaAmount(
      InvalidAdaAmount.ERROR_CODES.TOO_MANY_DECIMAL_PLACES,
    )
  }

  const value = parsed.times(MICRO)

  if (value.gte(MAX_ADA)) {
    throw new InvalidAdaAmount(InvalidAdaAmount.ERROR_CODES.TOO_LARGE)
  }

  if (value.lt(0)) {
    throw new InvalidAdaAmount(InvalidAdaAmount.ERROR_CODES.NEGATIVE)
  }

  if (value.eq(0)) {
    throw new InvalidAdaAmount(InvalidAdaAmount.ERROR_CODES.INVALID_AMOUNT)
  }

  return value
}
