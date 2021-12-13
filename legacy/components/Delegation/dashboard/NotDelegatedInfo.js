// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'
import {Image, View} from 'react-native'

import NotDelegatedImage from '../../../assets/img/testnet/no-transactions-yet.png'
import {Line, Text} from '../../UiKit'
import styles from './styles/NotDelegatedInfo.style'

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

type ExternalProps = {|
  +intl: IntlShape,
|}

const NotDelegatedInfo = ({intl}: ExternalProps) => (
  <View style={styles.wrapper}>
    <View style={styles.imageWrap}>
      <Image source={NotDelegatedImage} />
    </View>
    <Text style={[styles.text, styles.textFirstLine]}>{intl.formatMessage(messages.firstLine)}</Text>
    <Text style={[styles.text, styles.textSecondLine]}>{intl.formatMessage(messages.secondLine)}</Text>
    <Line />
  </View>
)

export default injectIntl(NotDelegatedInfo)
