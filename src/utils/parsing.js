// @flow
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'
import {LOVELACES_PER_ADA, TOTAL_SUPPLY, DECIMAL_PLACES_IN_ADA} from '../config'

export class InvalidAdaAmount extends ExtendableError {
  static ERROR_CODES = {
    // general parsing problem or amount is equal to 0
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    TOO_MANY_DECIMAL_PLACES: 'TOO_MANY_DECIMAL_PLACES',
    TOO_LARGE: 'TOO_LARGE',
    NEGATIVE: 'NEGATIVE',
  }

  constructor(errorCode: $Values<typeof InvalidAdaAmount.ERROR_CODES>) {
    super('InvalidAdaAmount')
    this.errorCode = errorCode
  }
}

export const parseAdaDecimal = (amount: string) => {
  const parsed = new BigNumber(amount, 10)
  if (parsed.isNaN()) {
    throw new InvalidAdaAmount(InvalidAdaAmount.ERROR_CODES.INVALID_AMOUNT)
  }

  if (parsed.decimalPlaces() > DECIMAL_PLACES_IN_ADA) {
    throw new InvalidAdaAmount(
      InvalidAdaAmount.ERROR_CODES.TOO_MANY_DECIMAL_PLACES,
    )
  }

  const value = parsed.times(LOVELACES_PER_ADA)

  if (value.gte(TOTAL_SUPPLY)) {
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
