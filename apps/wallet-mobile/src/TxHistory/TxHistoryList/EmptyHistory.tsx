import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../assets/img/no_transactions.png'
import {Spacer} from '../../components/Spacer'

export const EmptyHistory = () => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.empty} testID="emptyHistoryComponent">
      <Spacer height={20} />

      <Image style={styles.image} source={image} />

      <Spacer height={20} />

      <Text style={styles.emptyText}>{strings.noTransactions}</Text>

      <Spacer height={20} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    empty: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      ...typography['body-1-l-medium'],
      color: color.gray[900],
      width: '55%',
      textAlign: 'center',
    },
    image: {
      height: 100,
      width: 131,
    },
  })
  return styles
}

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    noTransactions: intl.formatMessage(messages.noTransactions),
  }
}
