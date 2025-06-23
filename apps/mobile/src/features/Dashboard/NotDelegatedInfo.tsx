import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'

import NotDelegatedImage from '../../assets/img/testnet/no-transactions-yet.png'
import {Line} from '../../components/Line'
import {Text} from '../../components/Text'

export const NotDelegatedInfo = () => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageWrap} testID="notDelegatedInfo">
        <Image source={NotDelegatedImage} />
      </View>

      <Text style={[styles.text, styles.textFirstLine]}>{strings.firstLine}</Text>

      <Text style={[styles.text, styles.textSecondLine]}>{strings.secondLine}</Text>

      <Line />
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
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
      color: color.gray_900,
      lineHeight: 22,
    },
    textFirstLine: {
      ...atoms.body_1_lg_regular,
      marginBottom: 12,
    },
    textSecondLine: {
      ...atoms.body_2_md_regular,
      marginBottom: 16,
    },
  })
  return styles
}

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
