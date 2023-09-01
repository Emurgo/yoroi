import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {Text} from '../../../components/Text'
import {currencyNames} from '../../../i18n/global-messages'
import {CurrencySymbol} from '../../../yoroi-wallets/types/other'

type Props = {
  nativeName: string
  symbol: CurrencySymbol
  selectCurrency: (symbol: CurrencySymbol) => void
  isSelected: boolean
}

export const CurrencyPickerItem = ({nativeName, symbol, selectCurrency, isSelected}: Props) => {
  const strings = useStrings()

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

        <Selected>{isSelected && <Icon.Check size={24} color="#3154CB" />}</Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => <View style={styles.row}>{children}</View>
const Description = ({children}: {children: React.ReactNode}) => <View style={styles.description}>{children}</View>
const Selected = ({children}: {children: React.ReactNode}) => <View style={styles.flag}>{children}</View>
const Title = ({children}: {children: React.ReactNode}) => <Text style={styles.bodyMedium}>{children}</Text>
const Subtitle = ({children}: {children: React.ReactNode}) => <Text style={styles.bodyRegular}>{children}</Text>

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomColor: '#DCE0E9',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  flag: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 2,
  },
  description: {
    flex: 8,
    flexDirection: 'column',
  },
  bodyMedium: {
    fontFamily: 'Rubik-Medium',
    color: '#242838',
    fontSize: 16,
    lineHeight: 24,
  },
  bodyRegular: {
    color: '#242838',
    fontSize: 12,
    lineHeight: 18,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    translatedName: (symbol: CurrencySymbol) => intl.formatMessage(currencyNames[symbol]),
  }
}
