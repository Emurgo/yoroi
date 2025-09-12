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
  selectCurrency: (symbol: Portfolio.Currency.Symbol) => void
  isSelected?: boolean
}

export const CurrencyItem = ({
  nativeName,
  symbol,
  selectCurrency,
  isSelected,
}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const title = strings.settings.currencySettings.translatedName(symbol)
  const subtitle = `${nativeName} (${symbol})`

  const handleSelectCurrency = () => {
    selectCurrency(symbol)
  }

  return (
    <TouchableOpacity onPress={handleSelectCurrency}>
      <Row>
        <Description>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </Description>

        <Selected>
          {isSelected && <Icon.Check size={24} color={p.primary_600} />}
        </Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: React.PropsWithChildren) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        a.flex_row,
        a.border_b,
        a.py_sm,
        {
          borderBottomColor: p.gray_200,
        },
      ]}
    >
      {children}
    </View>
  )
}

const Description = ({children}: React.PropsWithChildren) => {
  return (
    <View
      style={[
        {
          flex: 8,
        },
        a.flex_col,
      ]}
    >
      {children}
    </View>
  )
}

const Selected = ({children}: React.PropsWithChildren) => {
  return (
    <View
      style={[
        a.align_end,
        a.justify_center,
        {
          flex: 2,
        },
      ]}
    >
      {children}
    </View>
  )
}

const Title = ({children}: React.PropsWithChildren) => {
  const {palette: p} = useTheme()
  return (
    <Text
      style={[
        {
          color: p.gray_900,
        },
        a.body_1_lg_medium,
      ]}
    >
      {children}
    </Text>
  )
}

const Subtitle = ({children}: React.PropsWithChildren) => {
  const {palette: p} = useTheme()
  return (
    <Text
      style={[
        {
          color: p.gray_900,
        },
        a.body_3_sm_regular,
      ]}
    >
      {children}
    </Text>
  )
}
