import {atoms as a, useTheme} from '@yoroi/theme'
import {Portfolio} from '@yoroi/types'

import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {Text} from '~/ui/Text/Text'

type Props = {
  nativeName: string
  symbol: Portfolio.Currency.Symbol
  onSelectCurrency: (symbol: Portfolio.Currency.Symbol) => void
  isSelected?: boolean
}

export const CurrencyItem = ({
  nativeName,
  symbol,
  onSelectCurrency,
  isSelected,
}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const title = strings.settings.currencySettings.translatedName(symbol)
  const subtitle = `${nativeName} (${symbol})`

  const handleSelectCurrency = () => {
    onSelectCurrency(symbol)
  }

  return (
    <TouchableOpacity
      onPress={handleSelectCurrency}
      style={[a.flex_row, a.py_sm]}
    >
      <Description>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </Description>

      <Selected>
        {isSelected && <Icon.Check size={24} color={p.primary_600} />}
      </Selected>
    </TouchableOpacity>
  )
}

const Description = ({children}: React.PropsWithChildren) => {
  return <View style={[a.justify_between, a.flex_1]}>{children}</View>
}

const Selected = ({children}: React.PropsWithChildren) => {
  return <View style={[a.align_end, a.justify_center]}>{children}</View>
}

const Title = ({children}: React.PropsWithChildren) => {
  const {atoms: ta} = useTheme()
  return <Text style={[ta.text_gray_max, a.body_1_lg_medium]}>{children}</Text>
}

const Subtitle = ({children}: React.PropsWithChildren) => {
  const {atoms: ta} = useTheme()
  return (
    <Text style={[ta.text_gray_medium, a.body_3_sm_regular]}>{children}</Text>
  )
}
