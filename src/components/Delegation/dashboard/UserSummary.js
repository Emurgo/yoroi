// @flow
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard} from '../../UiKit'
import TotalAdaIcon from '../../../assets/staking/TotalAdaIcon'
import TotalRewardIcon from '../../../assets/staking/TotalRewardIcon'
import TotalDelegatedIcon from '../../../assets/staking/TotalDelegatedIcon'
import globalMessages from '../../../i18n/global-messages'
import styles from './styles/UserSummary.style'

const messages = defineMessages({
  title: {
    id: 'components.delegationsummary.userSummary.title',
    defaultMessage: '!!!Your Summary',
  },
  rewardsLabel: {
    id: 'components.delegationsummary.userSummary.totalRewards',
    defaultMessage: '!!!Total Rewards',
  },
  delegatedLabel: {
    id: 'components.delegationsummary.userSummary.totalDelegated',
    defaultMessage: '!!!Total Delegated',
  },
})

const ICON_DIM = 44

type ExternalProps = {|
  +intl: intlShape,
  +totalAdaSum: string,
  +totalRewards: string,
  +totalDelegated: string,
|}

const UserSummary = ({
  intl,
  totalAdaSum,
  totalRewards,
  totalDelegated,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)}>
      <View style={styles.stats}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <TotalAdaIcon width={ICON_DIM} height={ICON_DIM} />
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.label}>
              {intl.formatMessage(globalMessages.totalAda)}:
            </Text>
            <Text bold style={styles.value}>
              {totalAdaSum}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.icon}>
            <TotalRewardIcon width={ICON_DIM} height={ICON_DIM} />
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.label}>
              {intl.formatMessage(messages.rewardsLabel)}:
            </Text>
            <Text bold style={styles.value}>
              {totalRewards}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.icon}>
            <TotalDelegatedIcon width={ICON_DIM} height={ICON_DIM} />
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.label}>
              {intl.formatMessage(messages.delegatedLabel)}:
            </Text>
            <Text bold style={styles.value}>
              {totalDelegated}
            </Text>
          </View>
        </View>
      </View>
    </TitledCard>
  </View>
)

export default injectIntl(UserSummary)
