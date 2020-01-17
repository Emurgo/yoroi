// @flow
import React from 'react'
import type {ComponentType} from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard, ProgressCircle} from '../../UiKit'
import styles from './styles/EpochProgress.style'

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

const EpochProgress = ({intl, percentage, currentEpoch, endTime}: ExternalProps) => (
  <View style={styles.wrapper}>
    <TitledCard title={'Epoch Progress'}>
      <ProgressCircle percentage={percentage} />
    </TitledCard>
  </View>
)

export default injectIntl(EpochProgress)
