// @flow
import React from 'react'
import type {ComponentType} from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Card, ProgressCircle} from '../../UiKit'
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
  <View>
    <Card title={'Epoch Progress'}>
      <ProgressCircle percentage={percentage} />
    </Card>
    <Text>EpochProgress</Text>
  </View>
)

export default injectIntl(EpochProgress)
