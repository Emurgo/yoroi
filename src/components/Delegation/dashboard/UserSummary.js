// @flow

import {BigNumber} from 'bignumber.js'
import React from 'react'
import {View} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, TitledCard, Button} from '../../UiKit'
import TotalAdaIcon from '../../../assets/staking/TotalAdaIcon'
import TotalRewardIcon from '../../../assets/staking/TotalRewardIcon'
import TotalDelegatedIcon from '../../../assets/staking/TotalDelegatedIcon'
import {formatAdaWithText} from '../../../utils/format'
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
  isRewardsOff: {
    id: 'components.delegationsummary.userSummary.isRewardsOff',
    defaultMessage: '!!!Rewards off',
  },
})

const ICON_DIM = 44

type ExternalProps = {|
  +intl: IntlShape,
  +totalAdaSum: ?BigNumber,
  +totalRewards: ?BigNumber,
  +totalDelegated: ?BigNumber,
  +onWithdraw: () => void,
  +disableWithdraw: boolean,
  +isRewardsOff: boolean,
|}

const UserSummary = ({
  intl,
  totalAdaSum,
  totalRewards,
  totalDelegated,
  onWithdraw,
  disableWithdraw,
  isRewardsOff,
}: ExternalProps) => (
  <View style={styles.wrapper}>
    <TitledCard title={intl.formatMessage(messages.title)}>
      <View style={styles.stats}>
        {isRewardsOff && (
          <View style={styles.warningView}>
            <Text style={styles.warningText}>{intl.formatMessage(messages.isRewardsOff)}</Text>
          </View>
        )}
        {!isRewardsOff && (
          <>
            <View style={styles.row}>
              <View style={styles.icon}>
                <TotalAdaIcon width={ICON_DIM} height={ICON_DIM} />
              </View>
              <View style={styles.amountBlock}>
                <Text style={styles.label}>{intl.formatMessage(globalMessages.availableFunds)}:</Text>
                <Text bold style={styles.value}>
                  {totalAdaSum != null ? formatAdaWithText(totalAdaSum) : '-'}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.icon}>
                <TotalRewardIcon width={ICON_DIM} height={ICON_DIM} />
              </View>
              <View style={styles.amountBlock}>
                <Text style={styles.label}>{intl.formatMessage(messages.rewardsLabel)}:</Text>
                <Text bold style={styles.value}>
                  {totalRewards != null ? formatAdaWithText(totalRewards) : '-'}
                </Text>
              </View>
              <View style={styles.withdrawBlock}>
                <Button
                  disabled={
                    disableWithdraw ||
                    totalAdaSum == null ||
                    (totalAdaSum != null && totalAdaSum.eq(0)) ||
                    totalRewards == null ||
                    (totalRewards != null && totalRewards.eq(0))
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
                <Text style={styles.label}>{intl.formatMessage(messages.delegatedLabel)}:</Text>
                <Text bold style={styles.value}>
                  {totalDelegated != null ? formatAdaWithText(totalDelegated) : '-'}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </TitledCard>
  </View>
)

export default injectIntl(UserSummary)
