import {getYoroiDrepIdHex} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {LinearGradient} from 'expo-linear-gradient'
import * as React from 'react'
import {
  GestureResponderEvent,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

import {useCopy} from '~/features/Copy/context/CopyProvider'
import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {Space} from '~/ui/Space/Space'

import {YoroiRecordLink} from '../YoroiRecordLink/YoroiRecordLink'
import {formatDrepHashToCIP129Format} from '../drep'

type Props = {
  onDelegate?: () => void
  pending?: boolean
  isDelegating?: boolean
  truncateId?: boolean
  variant?: 'gradient' | 'plain'
}

const truncateDrepId = (id: string) => {
  if (id.length <= 20) return id
  return `${id.slice(0, 10)}...${id.slice(-8)}`
}

export const YoroiDrepCard = ({
  onDelegate,
  pending,
  isDelegating,
  truncateId,
  variant = 'gradient',
}: Props) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {copy, isCopying} = useCopy()
  const {
    wallet: {
      networkManager: {network},
    },
  } = useSelectedWallet()

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(network),
    [network],
  )

  const drepId = formatDrepHashToCIP129Format(yoroiDrepIdHex, 'key')

  const displayId = truncateId ? truncateDrepId(drepId) : drepId

  const handleCopy = (event: GestureResponderEvent) => {
    copy({text: drepId, event, feedback: strings.dashboard.copied})
  }

  const isPendingTarget = pending && isDelegating
  const showGradient = variant === 'gradient' && (!pending || isPendingTarget)

  const gradientColors = isPendingTarget
    ? ([p.gray_100, p.gray_100] as const)
    : isDelegating
      ? p.bg_gradient_2
      : p.bg_gradient_1

  const containerStyle: StyleProp<ViewStyle> = [
    a.rounded_sm,
    a.p_lg,
    a.border,
    {borderColor: p.gray_200, opacity: pending ? 0.5 : 1},
  ]

  const content = (
    <>
      <View style={[a.flex_row, a.align_center, a.gap_sm]}>
        <View
          style={[
            a.align_center,
            a.justify_center,
            a.rounded_full,
            {
              width: 48,
              height: 48,
              backgroundColor: pending ? p.el_gray_min : p.primary_500,
            },
          ]}
        >
          <Icon.YoroiLogo size={48} color={p.white_static} />
        </View>

        <Text style={[a.heading_4_medium, ta.text_gray_medium]}>
          {strings.staking.yoroiDrep}
        </Text>
      </View>

      <Space.Height.sm />

      <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
        {strings.staking.delegateToAYoroiDRepDescription}
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

      {isDelegating && !pending && (
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

      {!isDelegating && onDelegate && (
        <>
          <Space.Height.md />

          <Button
            title={strings.staking.confirmDelegation.delegateButtonLabel}
            type={ButtonType.Primary}
            onPress={onDelegate}
            disabled={pending}
          />
        </>
      )}

      <YoroiRecordLink />
    </>
  )

  if (showGradient) {
    return (
      <LinearGradient
        start={{x: 1, y: 1}}
        end={{x: 0, y: 0}}
        colors={gradientColors}
        style={containerStyle}
      >
        {content}
      </LinearGradient>
    )
  }

  return <View style={containerStyle}>{content}</View>
}
