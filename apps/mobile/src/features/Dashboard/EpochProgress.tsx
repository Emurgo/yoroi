import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {ProgressCircle} from '~/ui/ProgressCircle/ProgressCircle'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TitledCard} from '~/ui/TitledCard/TitledCard'

type Props = {
  percentage: number
  currentEpoch: number
  endTime: {
    d?: string
    h: string
    m: string
    s: string
  }
}

export const EpochProgress = ({percentage, currentEpoch, endTime}: Props) => {
  const strings = useStrings()
  const {palette: p} = useTheme()

  return (
    <TitledCard
      title={strings.dashboard.epochProgressTitle}
      testID="epochProgressTitleCard"
    >
      <View style={[{flexDirection: 'row', alignItems: 'center'}]}>
        <ProgressCircle percentage={percentage} />

        <Space.Width.xl />

        <View style={[{flex: 1, flexDirection: 'column', flexWrap: 'wrap'}]}>
          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
              },
            ]}
          >
            <Text
              style={[a.pr_sm, a.body_2_md_regular, {color: p.text_gray_low}]}
            >
              {strings.dashboard.epochProgressTitle}:
            </Text>

            <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
              {currentEpoch}
            </Text>
          </View>

          <Space.Height.sm />

          <View
            style={[
              {
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
              },
            ]}
          >
            <Text
              style={[a.pr_sm, a.body_2_md_regular, {color: p.text_gray_low}]}
            >
              {strings.dashboard.endsInLabel}:
            </Text>

            <View
              style={[
                {
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                },
              ]}
            >
              {endTime.d != null && (
                <Text
                  style={[
                    a.body_1_lg_regular,
                    a.px_2xs,
                    a.text_center,
                    {backgroundColor: p.gray_50, color: p.text_gray_medium},
                  ]}
                >
                  {endTime.d}
                </Text>
              )}

              <Space.Width.xs />

              <Text
                style={[
                  a.body_1_lg_regular,
                  a.px_2xs,
                  a.text_center,
                  {backgroundColor: p.gray_50, color: p.text_gray_medium},
                ]}
              >
                {endTime.h}
              </Text>

              <Space.Width.xs />

              <Text>:</Text>

              <Space.Width.xs />

              <Text
                style={[
                  a.body_1_lg_regular,
                  a.px_2xs,
                  a.text_center,
                  {backgroundColor: p.gray_50, color: p.text_gray_medium},
                ]}
              >
                {endTime.m}
              </Text>

              <Space.Width.xs />

              <Text>:</Text>

              <Space.Width.xs />

              <Text
                style={[
                  a.body_1_lg_regular,
                  a.px_2xs,
                  a.text_center,
                  {backgroundColor: p.gray_50, color: p.text_gray_medium},
                ]}
              >
                {endTime.s}
              </Text>

              <Space.Width.xs />
            </View>
          </View>
        </View>
      </View>
    </TitledCard>
  )
}

// Messages moved to centralized useStrings
