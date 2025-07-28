import React from 'react'
import {FlatList} from 'react-native'

import {CurrencySymbol} from '~/wallets/types/other'
import {useCurrencyPairing} from './CurrencyContext'
import {CurrencyPickerItem} from './CurrencyPickerItem'

export const CurrencyPickerList = () => {
  const {configCurrencies, currency, selectCurrency} = useCurrencyPairing()
  const currencies = Object.entries(configCurrencies)
    .map(([k, v]) => ({symbol: k as CurrencySymbol, data: v}))
    .filter(({symbol}) => symbol !== 'ADA')

  return (
    <FlatList
      contentContainerStyle={{padding: 16}}
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
