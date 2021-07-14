// @flow
import React from 'react'
import {View, Image} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, Line} from '../../UiKit'
import NotDelegatedImage from '../../../assets/img/testnet/no-transactions-yet.png'
import styles from './styles/NotDelegatedInfo.style'

const messages = defineMessages({
  firstLine: {
    id: 'components.delegationsummary.notDelegatedInfo.firstLine',
    defaultMessage: '!!!You have not delegated your ADA yet.',
  },
  secondLine: {
    id: 'components.delegationsummary.notDelegatedInfo.secondLine',
    defaultMessage:
      // eslint-disable-next-line max-len
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
