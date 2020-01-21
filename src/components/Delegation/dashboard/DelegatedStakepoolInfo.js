// @flow
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard} from '../../UiKit'
import {formatStakepoolNameWithTicker} from '../../../utils/format'
import styles from './styles/DelegatedStakepoolInfo.style'

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.delegatedStakepoolInfo.title',
    defaultMessage: '!!!Stake pool delegated',
  },
})

type ExternalProps = {|
  +intl: intlShape,
  +poolTicker: string,
  +poolName: string,
  +poolHash: string,
|}

const DelegatedStakepoolInfo = ({
  intl,
  poolTicker,
  poolName,
  poolHash,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)} variant={'poolInfo'} >
      <View style={styles.topBlock}>
        <Text bold style={styles.pooName}>
          {formatStakepoolNameWithTicker(poolTicker, poolName)}
        </Text>
        <Text style={styles.poolHash}>
          {poolHash}
        </Text>
      </View>
    </TitledCard>
  </View>
)

export default injectIntl(DelegatedStakepoolInfo)
