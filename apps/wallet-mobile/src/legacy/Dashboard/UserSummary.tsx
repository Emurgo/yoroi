import {useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button} from '../../components/Button/Button'
import {Icon} from '../../components/Icon'
import {Space} from '../../components/Space/Space'
import {Text} from '../../components/Text'
import {TitledCard} from '../../components/TitledCard'
import {usePrivacyMode} from '../../features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../kernel/i18n/global-messages'
import {formatAdaWithText} from '../../yoroi-wallets/utils/format'
import {asQuantity} from '../../yoroi-wallets/utils/utils'

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
  const {color} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive} = usePrivacyMode()

  return (
    <TitledCard title={strings.title} testID="userSummaryTitleCard">
      <View style={styles.stats}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Icon.TotalAda
              color={color.el_primary_medium}
              backgroundColor={color.gray_200}
              width={ICON_DIM}
              height={ICON_DIM}
            />
          </View>

          <Space width="lg" />

          <View style={styles.amountBlock}>
            <Text style={styles.label}>{strings.availableFunds}:</Text>

            <Text bold style={styles.value} testID="userSummaryAvailableFundsText">
              {!isPrivacyActive
                ? totalAdaSum != null
                  ? formatAdaWithText(asQuantity(totalAdaSum), wallet.portfolioPrimaryTokenInfo)
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        <Space height="lg" />

        <View style={styles.row}>
          <View style={styles.icon}>
            <Icon.TotalReward
              color={color.el_primary_medium}
              backgroundColor={color.gray_200}
              width={ICON_DIM}
              height={ICON_DIM}
            />
          </View>

          <Space width="lg" />

          <View style={styles.amountBlock}>
            <Text style={styles.label}>{strings.rewardsLabel}:</Text>

            <Text bold style={styles.value} testID="userSummaryRewardsText">
              {!isPrivacyActive
                ? totalRewards != null
                  ? formatAdaWithText(asQuantity(totalRewards), wallet.portfolioPrimaryTokenInfo)
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        <Space height="lg" />

        <View style={styles.row}>
          <View style={styles.icon}>
            <Icon.TotalDelegated
              color={color.el_primary_medium}
              backgroundColor={color.gray_200}
              width={ICON_DIM}
              height={ICON_DIM}
            />
          </View>

          <Space width="lg" />

          <View style={styles.amountBlock}>
            <Text style={styles.label}>{strings.delegatedLabel}:</Text>

            <Text bold style={styles.value} testID="userSummaryDelegatedText">
              {!isPrivacyActive
                ? totalDelegated != null
                  ? formatAdaWithText(asQuantity(totalDelegated), wallet.portfolioPrimaryTokenInfo)
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        <Space height="lg" />

        <View style={styles.row}>
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
    </TitledCard>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    stats: {
      ...atoms.flex_1,
      ...atoms.flex_col,
    },
    row: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.align_center,
    },
    icon: {},
    amountBlock: {
      ...atoms.flex_col,
    },
    label: {
      color: color.text_gray_low,
      ...atoms.body_3_sm_regular,
    },
    value: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_medium,
    },
    withdrawButton: {
      ...atoms.px_lg,
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
