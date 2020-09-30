// @flow
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, TitledCard, Button} from '../../UiKit'
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
  withdrawButtonTitle: {
    id: 'components.delegationsummary.userSummary.withdrawButtonTitle',
    defaultMessage: '!!!Withdraw',
  },
})

const ICON_DIM = 44

type ExternalProps = {|
  +intl: intlShape,
  +totalAdaSum: string | null,
  +totalRewards: string | null,
  +totalDelegated: string | null,
  +onWithdraw: () => void,
|}

const UserSummary = ({
  intl,
  totalAdaSum,
  totalRewards,
  totalDelegated,
  onWithdraw,
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
              {intl.formatMessage(globalMessages.availableFunds)}:
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
          <View style={styles.withdrawBlock}>
            <Button
              disabled={
                new BigNumber(totalAdaSum ?? '0').eq(0) ||
                new BigNumber(totalRewards ?? '0').eq(0)
              }
              outlineOnLight
              shelleyTheme
              onPress={onWithdraw}
              title={intl.formatMessage(messages.withdrawButtonTitle)}
              style={styles.withdrawButton}
            />
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
