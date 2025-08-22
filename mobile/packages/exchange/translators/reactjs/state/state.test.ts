import {
  ExchangeAction,
  ExchangeActionType,
  exchangeDefaultState,
  exchangeReducer,
} from './state'

describe('State Actions', () => {
  it('unknown', () => {
    const action = {type: 'UNKNOWN'} as any

    try {
      exchangeReducer(exchangeDefaultState, action)

      fail('it should crash before')
    } catch (e: any) {
      expect(e.message).toEqual('ExchangeFormReducer invalid action')
    }
  })

  describe('OrderTypeChanged', () => {
    it('changes order type but does not change provider id', () => {
      const action: ExchangeAction = {
        type: ExchangeActionType.OrderTypeChanged,
        orderType: 'sell',
      }

      const state = exchangeReducer(
        {
          ...exchangeDefaultState,
          orderType: 'buy',
          amount: {
            disabled: false,
            value: 2000000,
            displayValue: '2',
            error: 'fake-error',
          },
          canExchange: true,
        },
        action,
      )

      expect(state.orderType).toBe('sell')
      expect(state.amount).toEqual(exchangeDefaultState.amount)
      expect(state.canExchange).toEqual(exchangeDefaultState.canExchange)
    })

    it('changes order type to buy and changes provider id', () => {
      const action: ExchangeAction = {
        type: ExchangeActionType.OrderTypeChanged,
        orderType: 'buy',
      }

      const state = exchangeReducer(
        {
          ...exchangeDefaultState,
          orderType: 'sell',
          providerId: 'banxa',
          providerSuggestedByOrderType: {buy: 'encryptus', sell: 'banxa'},
        },
        action,
      )

      expect(state.orderType).toBe('buy')
      expect(state.providerId).toBe('encryptus')
    })

    it('changes order type to sell and changes provider id', () => {
      const action: ExchangeAction = {
        type: ExchangeActionType.OrderTypeChanged,
        orderType: 'sell',
      }

      const state = exchangeReducer(
        {
          ...exchangeDefaultState,
          orderType: 'buy',
          providerId: 'encryptus',
          providerSuggestedByOrderType: {buy: 'encryptus', sell: 'banxa'},
        },
        action,
      )

      expect(state.orderType).toBe('sell')
      expect(state.providerId).toBe('banxa')
    })
  })

  describe('AmountInputChanged', () => {
    it('changes values', () => {
      const action: ExchangeAction = {
        type: ExchangeActionType.AmountInputChanged,
        amount: {
          disabled: false,
          value: 2000000,
          displayValue: '2',
          error: 'fake-error',
        },
        canExchange: false,
      }

      const state = exchangeReducer(exchangeDefaultState, action)
      expect(state.amount).toEqual(action.amount)
      expect(state.canExchange).toEqual(action.canExchange)
    })
  })

  describe('ProviderIdChanged', () => {
    it('changes values', () => {
      const action: ExchangeAction = {
        type: ExchangeActionType.ProviderIdChanged,
        providerId: 'encryptus',
      }

      const amount = {
        disabled: false,
        value: 2000000,
        displayValue: '2',
        error: 'fake-error',
      }

      const state = exchangeReducer(
        {
          ...exchangeDefaultState,
          amount,
          canExchange: true,
          providerId: 'banxa',
        },
        action,
      )
      expect(state.amount).toEqual(exchangeDefaultState.amount)
      expect(state.canExchange).toBe(exchangeDefaultState.canExchange)
      expect(state.providerId).toBe('encryptus')
    })
  })
})
