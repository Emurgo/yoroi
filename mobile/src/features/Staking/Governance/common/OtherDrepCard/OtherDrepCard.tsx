import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {GestureResponderEvent, Text, TouchableOpacity, View} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

type Props = {
  drepId: string
  onDelegate?: () => void
  pending?: boolean
  isDelegating?: boolean
  truncateId?: boolean
}

const truncateDrepId = (id: string) => {
  if (id.length <= 20) return id
  return `${id.slice(0, 10)}...${id.slice(-8)}`
}

export const OtherDrepCard = ({
  drepId,
  onDelegate,
  pending,
  isDelegating,
  truncateId,
}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {copy, isCopying} = useCopy()

  const displayId = truncateId ? truncateDrepId(drepId) : drepId

  const handleCopy = (event: GestureResponderEvent) => {
    copy({text: drepId, event, feedback: strings.dashboard.copied})
  }

  const gradientColors = pending
    ? ([p.gray_100, p.gray_100] as const)
    : isDelegating
      ? p.bg_gradient_2
      : p.bg_gradient_1

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
              backgroundColor: pending
                ? p.gray_200
                : isDelegating
                  ? p.secondary_200
                  : p.bg_color_min,
            },
          ]}
        >
          <Icon.OtherDreps size={24} color={p.el_gray_medium} />
        </View>

        <Text style={[a.heading_4_medium, ta.text_gray_medium]}>
          {strings.staking.otherDReps}
        </Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.staking.actionDelegateToADRepDescription}
      </Text>

      <Space.Height.md />

      <View style={[a.flex_row, a.align_start, a.gap_lg]}>
        <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
          {strings.staking.id}
        </Text>

        <View style={[a.flex_1]}>
          <Text
            style={[a.body_2_md_regular, ta.text_gray_medium, a.text_right]}
            selectable
          >
            {displayId}
          </Text>
        </View>

        <TouchableOpacity onPress={handleCopy} activeOpacity={0.5}>
          {isCopying ? (
            <Icon.CopySuccess size={24} color={p.gray_900} />
          ) : (
            <Icon.Copy size={24} color={p.gray_900} />
          )}
        </TouchableOpacity>
      </View>

      {/* TODO: API for drep status is not ready yet
      <Space.Height.md />

      <View style={[a.flex_row, a.align_center, a.justify_between]}>
        <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
          {strings.staking.drepStatusLabel}
        </Text>

        <View
          style={[
            a.rounded_full,
            {
              paddingHorizontal: 12,
              paddingVertical: 4,
              backgroundColor: p.secondary_600,
            },
          ]}
        >
          <Text style={[a.body_2_md_regular, {color: p.gray_min}]}>
            {strings.staking.drepStatusActive}
          </Text>
        </View>
      </View>
      */}

      {isDelegating && (
        <>
          <Space.Height.md />

          <View style={[a.flex_row, a.align_center, a.justify_between]}>
            <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
              {strings.staking.delegationStatusLabel}
            </Text>

            <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
              {strings.staking.delegationStatusDelegating}
            </Text>
          </View>
        </>
      )}

      <Space.Height.md />

      <Button
        title={strings.staking.delegateToOtherDrep}
        type={ButtonType.Secondary}
        size="S"
        onPress={onDelegate}
        disabled={pending}
      />
    </LinearGradient>
  )
}
