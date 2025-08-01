import {atoms as a, useTheme} from '@yoroi/theme'
import {BigNumber} from 'bignumber.js'
import React from 'react'
import {View} from 'react-native'

import {usePrivacyMode} from '~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonProps, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TitledCard} from '~/ui/TitledCard/TitledCard'
import {formatAdaWithText} from '~/wallets/utils/format'
import {asQuantity} from '~/wallets/utils/utils'

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
    <TitledCard title={strings.dashboard.title} testID="userSummaryTitleCard">
      <View style={[a.flex_1, a.flex_col]}>
        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalAda color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space.Width.lg />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.dashboard.availableFunds}:
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

        <Space.Height.lg />

        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalReward color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space.Width.lg />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.dashboard.rewardsLabel}:
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

        <Space.Height.lg />

        <View style={[a.flex_1, a.flex_row, a.align_center]}>
          <View>
            <Icon.TotalDelegated color={p.el_primary_medium} size={ICON_DIM} />
          </View>

          <Space.Width.lg />

          <View style={[a.flex_col]}>
            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {strings.dashboard.delegatedLabel}:
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
            <Space.Height.lg />

            <Button
              type={ButtonType.Secondary}
              size="S"
              title={strings.dashboard.withdrawButtonTitle}
              {...ctaProps}
              testID="userSummaryWithdrawButton"
            />
          </>
        )}
      </View>
    </TitledCard>
  )
}
