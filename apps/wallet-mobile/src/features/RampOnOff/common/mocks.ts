import {RampOnOffState} from './RampOnOffProvider'

export const actionRamp = {
  sellAda: 'sell',
  buyAda: 'buy',
} as const

export const mockExchangeStateDefault: RampOnOffState = {
  actionType: actionRamp.buyAda,
  amount: {
    isTouched: true,
    disabled: false,
    error: undefined,
    displayValue: '',
    value: 0,
  },
  canExchange: false,
}

export const mockExchangeStateWithNotEnoughError: RampOnOffState = {
  actionType: actionRamp.sellAda,
  amount: {
    isTouched: true,
    disabled: false,
    error: 'Not Enough Balance',
    displayValue: '3000',
    value: 3000 * 10 ** 6,
  },
  canExchange: false,
}
