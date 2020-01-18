// @flow
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'
import {Text, TitledCard, ProgressCircle} from '../../UiKit'
import styles from './styles/EpochProgress.style'

const messages = defineMessages({
  epochProgressTitle: {
    id: 'components.delegationsummary.epochProgress.title',
    defaultMessage: '!!!Epoch progress',
  },
  endsInLabel: {
    id: 'components.delegationsummary.epochProgress.endsIn',
    defaultMessage: '!!!Ends in',
  },
})

type ExternalProps = {
  +intl: intlShape,
  +percentage: number,
  +currentEpoch: number,
  +endTime: {
    +h: string,
    +m: string,
    +s: string,
  },
}

const EpochProgress = ({
  intl,
  percentage,
  currentEpoch,
  endTime,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.epochProgressTitle)}>
      <ProgressCircle percentage={percentage} />
      <View style={styles.stats}>
        <View style={styles.row}>
          <Text style={styles.label}>{intl.formatMessage(globalMessages.epochLabel)}:</Text>
          <Text style={styles.value}>{currentEpoch}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{intl.formatMessage(messages.endsInLabel)}:</Text>
          <Text style={styles.timeBlock}>{endTime.h}</Text><Text>:</Text>
          <Text style={styles.timeBlock}>{endTime.m}</Text><Text>:</Text>
          <Text style={styles.timeBlock}>{endTime.s}</Text>
        </View>
      </View>
    </TitledCard>
  </View>
)

export default injectIntl(EpochProgress)
