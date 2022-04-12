import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {TotalAdaIcon} from '../assets/staking/TotalAdaIcon'
import {TotalDelegatedIcon} from '../assets/staking/TotalDelegatedIcon'
import {TotalRewardIcon} from '../assets/staking/TotalRewardIcon'
import {Button, Text, TitledCard} from '../components'
import globalMessages from '../i18n/global-messages'
import {formatAdaWithText} from '../legacy/format'
import {COLORS} from '../theme'

const ICON_DIM = 44

type Props = {
  totalAdaSum: BigNumber | null
  totalRewards: BigNumber | null
  totalDelegated: BigNumber | null
  onWithdraw: () => void
  disableWithdraw: boolean
}

export const UserSummary = ({totalAdaSum, totalRewards, totalDelegated, onWithdraw, disableWithdraw}: Props) => {
  const strings = useStrings()

  return (
    <View style={styles.wrapper}>
      <TitledCard title={strings.title}>
        <View style={styles.stats}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <TotalAdaIcon width={ICON_DIM} height={ICON_DIM} />
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.label}>{strings.availableFunds}:</Text>
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
              <Text style={styles.label}>{strings.rewardsLabel}:</Text>
              <Text bold style={styles.value}>
                {totalRewards != null ? formatAdaWithText(totalRewards) : '-'}
              </Text>
            </View>

            <View style={styles.withdrawBlock}>
              <Button
                disabled={disableWithdraw}
                outlineOnLight
                shelleyTheme
                onPress={onWithdraw}
                title={strings.withdrawButtonTitle}
                style={styles.withdrawButton}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.icon}>
              <TotalDelegatedIcon width={ICON_DIM} height={ICON_DIM} />
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.label}>{strings.delegatedLabel}:</Text>
              <Text bold style={styles.value}>
                {totalDelegated != null ? formatAdaWithText(totalDelegated) : '-'}
              </Text>
            </View>
          </View>
        </View>
      </TitledCard>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  row: {
    flex: 1,
    paddingVertical: 8,
    flexDirection: 'row',
  },
  icon: {
    paddingLeft: 8,
    paddingRight: 18,
  },
  amountBlock: {
    flexDirection: 'column',
  },
  label: {
    color: COLORS.DARK_TEXT,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    color: COLORS.DARK_GRAY,
    lineHeight: 24,
    fontSize: 16,
  },
  withdrawBlock: {
    flex: 1,
    padding: 5,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  withdrawButton: {
    minHeight: 18,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    rewardsLabel: intl.formatMessage(messages.rewardsLabel),
    delegatedLabel: intl.formatMessage(messages.delegatedLabel),
    withdrawButtonTitle: intl.formatMessage(messages.withdrawButtonTitle),
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
  }
}

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
