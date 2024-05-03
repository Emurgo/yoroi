import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Icon, Text, TitledCard} from '../components'
import {usePrivacyMode} from '../features/Settings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../features/WalletManager/Context'
import globalMessages from '../i18n/global-messages'
import {formatAdaWithText} from '../legacy/format'
import {asQuantity} from '../yoroi-wallets/utils'

const ICON_DIM = 44

type Props = {
  totalAdaSum: BigNumber | null
  totalRewards: BigNumber | null
  totalDelegated: BigNumber | null
  onWithdraw: () => void
  disableWithdraw: boolean
}

export const UserSummary = ({totalAdaSum, totalRewards, totalDelegated, onWithdraw, disableWithdraw}: Props) => {
  const styles = useStyles()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {isPrivacyOn} = usePrivacyMode()

  return (
    <View style={styles.wrapper}>
      <TitledCard title={strings.title} testID="userSummaryTitleCard">
        <View style={styles.stats}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Icon.TotalAda width={ICON_DIM} height={ICON_DIM} />
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.label}>{strings.availableFunds}:</Text>

              <Text bold style={styles.value} testID="userSummaryAvailableFundsText">
                {isPrivacyOn
                  ? totalAdaSum != null
                    ? formatAdaWithText(asQuantity(totalAdaSum), wallet.primaryToken)
                    : '-'
                  : '**.******'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.icon}>
              <Icon.TotalReward width={ICON_DIM} height={ICON_DIM} />
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.label}>{strings.rewardsLabel}:</Text>

              <Text bold style={styles.value} testID="userSummaryRewardsText">
                {isPrivacyOn
                  ? totalRewards != null
                    ? formatAdaWithText(asQuantity(totalRewards), wallet.primaryToken)
                    : '-'
                  : '**.******'}
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
                testID="userSummaryWithdrawButton"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.icon}>
              <Icon.TotalDelegated width={ICON_DIM} height={ICON_DIM} />
            </View>

            <View style={styles.amountBlock}>
              <Text style={styles.label}>{strings.delegatedLabel}:</Text>

              <Text bold style={styles.value} testID="userSummaryDelegatedText">
                {isPrivacyOn
                  ? totalDelegated != null
                    ? formatAdaWithText(asQuantity(totalDelegated), wallet.primaryToken)
                    : '-'
                  : '**.******'}
              </Text>
            </View>
          </View>
        </View>
      </TitledCard>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
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
      ...atoms.py_sm,
      flexDirection: 'row',
    },
    icon: {
      paddingLeft: 8,
      ...atoms.p_sm,
      ...atoms.pr_lg,
    },
    amountBlock: {
      flexDirection: 'column',
    },
    label: {
      color: color.gray_c900,
      ...atoms.body_2_md_regular,
    },
    value: {
      color: color.gray_c800,
      ...atoms.body_1_lg_regular,
    },
    withdrawBlock: {
      flex: 1,
      ...atoms.p_xs,
      justifyContent: 'flex-end',
      flexDirection: 'row',
    },
    withdrawButton: {
      minHeight: 18,
    },
  })

  return styles
}

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
