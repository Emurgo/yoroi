import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'

import NotDelegatedImage from '../../assets/img/testnet/no-transactions-yet.png'
import {Line} from '../../ui/Line/Line'
import {Text} from '../../ui/Text/Text'

export const NotDelegatedInfo = () => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageWrap} testID="notDelegatedInfo">
        <Image source={NotDelegatedImage} />
      </View>

      <Text style={[styles.text, styles.textFirstLine, {color: color.gray_900}]}>{strings.firstLine}</Text>

      <Text style={[styles.text, styles.textSecondLine, {color: color.gray_900}]}>{strings.secondLine}</Text>

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
    lineHeight: 22,
  },
  textFirstLine: {
    ...a.body_1_lg_regular,
    marginBottom: 12,
  },
  textSecondLine: {
    ...a.body_2_md_regular,
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