import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type GovernanceStatusType = 'abstain' | 'no-confidence'

type Props = {
  type: GovernanceStatusType
  isDelegating?: boolean
  onChangeToDrep?: () => void
  onDelegate?: () => void
  pending?: boolean
}

export const GovernanceStatusCard = ({
  type,
  isDelegating,
  onChangeToDrep,
  onDelegate,
  pending,
}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const isAbstain = type === 'abstain'

  const title = isAbstain
    ? strings.staking.actionAbstainTitle
    : strings.staking.actionNoConfidenceTitle

  const description = isAbstain
    ? strings.staking.actionAbstainDescription
    : strings.staking.actionNoConfidenceDescription

  const IconComponent = isAbstain ? Icon.Abstain : Icon.NoConfidence

  const buttonTitle = isDelegating
    ? strings.staking.changeToDrep
    : strings.staking.confirmDelegation.delegateButtonLabel

  const handlePress = isDelegating ? onChangeToDrep : onDelegate

  const gradientColors = pending
    ? ([p.gray_100, p.gray_100] as const)
    : p.bg_gradient_2

  if (isDelegating) {
    return (
      <LinearGradient
        start={{x: 1, y: 1}}
        end={{x: 0, y: 0}}
        colors={gradientColors}
        style={[
          a.rounded_sm,
          a.p_lg,
          a.border,
          {borderColor: p.gray_200, opacity: pending ? 0.5 : 1},
        ]}
      >
        <View style={[a.flex_row, a.align_center, a.gap_sm]}>
          <View
            style={[
              a.align_center,
              a.justify_center,
              a.rounded_full,
              {
                width: 48,
                height: 48,
                backgroundColor: pending ? p.gray_200 : p.secondary_200,
              },
            ]}
          >
            <IconComponent size={24} color={p.el_gray_medium} />
          </View>

          <Text style={[a.heading_4_medium, ta.text_gray_medium]}>{title}</Text>
        </View>

        <Space.Height.sm />

        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {description}
        </Text>

        <Space.Height.md />

        <View style={[a.flex_row, a.align_center, a.justify_between]}>
          <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
            {strings.staking.delegationStatusLabel}
          </Text>

          <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
            {strings.staking.delegationStatusDelegating}
          </Text>
        </View>

        <Space.Height.md />

        <Button
          title={buttonTitle}
          type={ButtonType.Secondary}
          onPress={handlePress}
          disabled={pending}
        />
      </LinearGradient>
    )
  }

  return (
    <View
      style={[
        a.rounded_sm,
        a.p_lg,
        a.border,
        {borderColor: p.gray_200, opacity: pending ? 0.5 : 1},
      ]}
    >
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <View
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            {
              width: 48,
              height: 48,
              backgroundColor: pending ? p.gray_200 : p.bg_color_min,
            },
          ]}
        >
          <IconComponent size={24} color={p.el_gray_medium} />
        </View>

        <Text style={[a.heading_4_medium, ta.text_gray_medium]}>{title}</Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {description}
      </Text>

      <Space.Height.md />

      <Button
        title={buttonTitle}
        type={ButtonType.Secondary}
        onPress={handlePress}
        disabled={pending}
      />
    </View>
  )
}
