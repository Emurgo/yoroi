import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {CurrencySymbol} from '../../../yoroi-wallets/types/other'
import {useCurrencyContext} from './CurrencyContext'
import {CurrencyPickerItem} from './CurrencyPickerItem'

export const CurrencyPickerList = () => {
  const {configCurrencies, currency, selectCurrency} = useCurrencyContext()
  const currencies = Object.entries(configCurrencies).map(([k, v]) => ({symbol: k as CurrencySymbol, data: v}))

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
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

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
})
