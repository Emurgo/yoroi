import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native'

import {currencyNames} from '../../../../../kernel/i18n/global-messages'
import {Icon} from '../../../../../ui/Icon'
import {Text} from '../../../../../ui/Text/Text'

type Props = {
  nativeName: string
  symbol: string
  selectCurrency: (symbol: string) => void
  isSelected: boolean
}

export const CurrencyPickerItem = ({
  nativeName,
  symbol,
  selectCurrency,
  isSelected,
}: Props) => {
  const strings = useStrings()
  const {colors} = useStyles()

  const title = strings.translatedName(symbol)
  const subtitle = `${nativeName} (${symbol})`

  const handleSelectCurrency = () => {
    Alert.alert('handleSelectCurrency not implemented')
  }

  return (
    <TouchableOpacity activeOpacity={0.5} onPress={handleSelectCurrency}>
      <Row>
        <Description>
          <Title>{title}</Title>

          <Subtitle>{subtitle}</Subtitle>
        </Description>

        <Selected>
          {isSelected && <Icon.Check size={24} color={colors.checkIcon} />}
        </Selected>
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
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomColor: p.gray_200,
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
      color: p.gray_900,
      ...a.body_1_lg_medium,
    },
    bodyRegular: {
      color: p.gray_900,
      ...a.body_3_sm_regular,
    },
  })
  const colors = {
    checkIcon: p.primary_600,
  }
  return {styles, colors}
}

const useStrings = () => {
  const intl = useIntl()

  return {
    translatedName: (symbol: string) => intl.formatMessage(currencyNames.ADA),
  }
}
