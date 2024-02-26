import {useTheme} from '@yoroi/theme'
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
  const {colors} = useStyles()

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

        <Selected>{isSelected && <Icon.Check size={24} color={colors.checkIcon} />}</Selected>
      </Row>
    </TouchableOpacity>
  )
}

const Row = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.row}>{children}</View>
}
const Description = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.description}>{children}</View>
}
const Selected = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <View style={styles.flag}>{children}</View>
}
const Title = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <Text style={styles.bodyMedium}>{children}</Text>
}
const Subtitle = ({children}: {children: React.ReactNode}) => {
  const {styles} = useStyles()
  return <Text style={styles.bodyRegular}>{children}</Text>
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomColor: color.gray[200],
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
      color: color.gray[900],
      fontSize: 16,
      lineHeight: 24,
    },
    bodyRegular: {
      color: color.gray[900],
      fontSize: 12,
      lineHeight: 18,
    },
  })
  const colors = {
    checkIcon: color.primary[600],
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    translatedName: (symbol: CurrencySymbol) => intl.formatMessage(currencyNames[symbol]),
  }
}
