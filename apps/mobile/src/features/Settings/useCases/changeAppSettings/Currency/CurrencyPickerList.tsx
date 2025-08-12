import {atoms as a} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'
import {FlatList} from 'react-native'

import {useCurrencyPairing} from './CurrencyContext'
import {CurrencyPickerItem} from './CurrencyPickerItem'

export const CurrencyPickerList = () => {
  const {configCurrencies, currency, selectCurrency} = useCurrencyPairing()
  const currencies = Object.entries(configCurrencies)
    .map(([k, v]) => ({symbol: k as Portfolio.Currency.Symbol, data: v}))
    .filter(({symbol}) => symbol !== 'ADA')

  return (
    <FlatList
      contentContainerStyle={{...a.p_lg}}
      data={currencies}
      keyExtractor={({symbol}) => symbol}
      renderItem={({item: {symbol, data}}) => (
        <CurrencyPickerItem
          isSelected={symbol === currency}
          nativeName={data.nativeName}
          symbol={symbol}
          selectCurrency={selectCurrency}
        />
      )}
    />
  )
}
