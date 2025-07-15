import {atoms as a, useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'

import {usePrivacyMode} from '../../features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages from '../../kernel/i18n/global-messages'
import {Button, ButtonProps, ButtonType} from '../../ui/Button/Button'
import {Icon} from '../../ui/Icon'
import {Space} from '../../ui/Space/Space'
import {Text} from '../../ui/Text/Text'
import {TitledCard} from '../../ui/TitledCard/TitledCard'
import {formatAdaWithText} from '../../wallets/utils/format'
import {asQuantity} from '../../wallets/utils/utils'

const ICON_DIM = 44

type Props = {
  totalAdaSum: BigNumber | null
  totalRewards: BigNumber | null
  totalDelegated: BigNumber | null
  ctaProps?: ButtonProps
}

export const UserSummary = ({
  totalAdaSum,
  totalRewards,
  totalDelegated,
  ctaProps,
}: Props) => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {isPrivacyActive} = usePrivacyMode()

  return (
    <TitledCard title={strings.title} testID="userSummaryTitleCard">
      <View style={[a.flex_1, a.flex_col]}>
        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalAda color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space width="lg" />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.availableFunds}:
            </Text>

            <Text
              bold
              style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}
              testID="userSummaryAvailableFundsText"
            >
              {!isPrivacyActive
                ? totalAdaSum != null
                  ? formatAdaWithText(
                      asQuantity(totalAdaSum),
                      wallet.portfolioPrimaryTokenInfo,
                    )
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        <Space height="lg" />

        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalReward color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space width="lg" />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.rewardsLabel}:
            </Text>

            <Text
              bold
              style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}
              testID="userSummaryRewardsText"
            >
              {!isPrivacyActive
                ? totalRewards != null
                  ? formatAdaWithText(
                      asQuantity(totalRewards),
                      wallet.portfolioPrimaryTokenInfo,
                    )
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        <Space height="lg" />

        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalDelegated color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space width="lg" />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.delegatedLabel}:
            </Text>

            <Text
              bold
              style={[a.body_1_lg_medium, {color: p.text_gray_medium}]}
              testID="userSummaryDelegatedText"
            >
              {!isPrivacyActive
                ? totalDelegated != null
                  ? formatAdaWithText(
                      asQuantity(totalDelegated),
                      wallet.portfolioPrimaryTokenInfo,
                    )
                  : '-'
                : '******'}
            </Text>
          </View>
        </View>

        {ctaProps && (
          <>
            <Space height="lg" />

            <Button
              type={ButtonType.Secondary}
              size="S"
              title={strings.withdrawButtonTitle}
              {...ctaProps}
              testID="userSummaryWithdrawButton"
            />
          </>
        )}
      </View>
    </TitledCard>
  )
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
