import {atoms as a} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useCurrencyPairing} from '~/features/Settings/context/CurrencyProvider'
import {Hr} from '~/ui/Hr/Hr'

import {CurrencyItem} from './CurrencyItem'

export const SelectCurrencySymbolScreen = () => {
  const {configCurrencies, currency, selectCurrency} = useCurrencyPairing()
  const currencies = Object.entries(configCurrencies)
    .map(([k, v]) => ({symbol: k as Portfolio.Currency.Symbol, data: v}))
    .filter(({symbol}) => symbol !== 'ADA')

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, a.px_lg]}
    >
      <FlatList
        data={currencies}
        keyExtractor={({symbol}) => symbol}
        ItemSeparatorComponent={Hr}
        renderItem={({item: {symbol, data}}) => (
          <CurrencyItem
            isSelected={symbol === currency}
            nativeName={data.nativeName}
            symbol={symbol}
            selectCurrency={selectCurrency}
          />
        )}
      />
    </SafeAreaView>
  )
}
