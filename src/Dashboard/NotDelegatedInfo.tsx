import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'

import NotDelegatedImage from '../assets/img/testnet/no-transactions-yet.png'
import {Line, Text} from '../components'
import {COLORS} from '../theme'

export const NotDelegatedInfo = () => {
  const strings = useStrings()

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageWrap}>
        <Image source={NotDelegatedImage} />
      </View>

      <Text style={[styles.text, styles.textFirstLine]}>{strings.firstLine}</Text>
      <Text style={[styles.text, styles.textSecondLine]}>{strings.secondLine}</Text>

      <Line />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  imageWrap: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: COLORS.DARK_TEXT,
    lineHeight: 22,
  },
  textFirstLine: {
    fontSize: 16,
    marginBottom: 12,
  },
  textSecondLine: {
    fontSize: 14,
    marginBottom: 16,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    firstLine: intl.formatMessage(messages.firstLine),
    secondLine: intl.formatMessage(messages.secondLine),
  }
}

const messages = defineMessages({
  firstLine: {
    id: 'components.delegationsummary.notDelegatedInfo.firstLine',
    defaultMessage: '!!!You have not delegated your ADA yet.',
  },
  secondLine: {
    id: 'components.delegationsummary.notDelegatedInfo.secondLine',
    defaultMessage:
      '!!!Go to Staking center to choose which stake pool you want to delegate in. Note, you may delegate only to one stake pool in this Tesnnet.',
  },
})
