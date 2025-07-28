import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {TouchableOpacity, View} from 'react-native'

import {currencyNames} from '../../../../../kernel/i18n/global-messages'
import {Icon} from '../../../../../ui/Icon'
import {Text} from '../../../../../ui/Text/Text'
import {CurrencySymbol} from '../../../../../wallets/types/other'

type Props = {
  nativeName: string
  symbol: CurrencySymbol
  selectCurrency: (symbol: CurrencySymbol) => void
  isSelected: boolean
}

export const CurrencyPickerItem = ({
  nativeName,
  symbol,
  selectCurrency,
  isSelected,
}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const title = strings.translatedName(symbol)
  const subtitle = `${nativeName} (${symbol})`

  const handleSelectCurrency = () => {
    selectCurrency(symbol)
  }

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={handleSelectCurrency}>
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

const Row = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return (
    <View
      style={[
        a.flex_row,
        {
          borderBottomColor: p.gray_200,
          borderBottomWidth: 1,
          paddingVertical: 8,
        },
      ]}
    >
      {children}
    </View>
  )
}
const Description = ({children}: {children: React.ReactNode}) => {
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
const Selected = ({children}: {children: React.ReactNode}) => {
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
const Title = ({children}: {children: React.ReactNode}) => {
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
const Subtitle = ({children}: {children: React.ReactNode}) => {
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

const useStrings = () => {
  const intl = useIntl()

  return {
    translatedName: (symbol: CurrencySymbol) =>
      intl.formatMessage(currencyNames[symbol]),
  }
}
