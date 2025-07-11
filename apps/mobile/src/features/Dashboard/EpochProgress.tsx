import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {ProgressCircle} from '../../ui/ProgressCircle/ProgressCircle'
import {Space} from '../../ui/Space/Space'
import {Spacer} from '../../ui/Spacer/Spacer'
import {Text} from '../../ui/Text/Text'
import {TitledCard} from '../../ui/TitledCard/TitledCard'

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
  const intl = useIntl()
  const {color} = useTheme()

  return (
    <TitledCard title={intl.formatMessage(messages.epochProgressTitle)} testID="epochProgressTitleCard">
      <View style={styles.wrapper}>
        <ProgressCircle percentage={percentage} />

        <Spacer width={40} />

        <View style={styles.stats}>
          <View style={styles.row}>
            <Text style={[styles.label, {color: color.text_gray_low}]}>
              {intl.formatMessage(messages.epochProgressTitle)}:
            </Text>

            <Text style={[styles.value, {color: color.text_gray_medium}]}>{currentEpoch}</Text>
          </View>

          <Space height="sm" />

          <View style={styles.row}>
            <Text style={[styles.label, {color: color.text_gray_low}]}>
              {intl.formatMessage(messages.endsInLabel)}:
            </Text>

            <View style={styles.timeWrapper}>
              {endTime.d != null && <Text style={[styles.timeBlock, {backgroundColor: color.gray_50, color: color.text_gray_medium}]}>{endTime.d}</Text>}

              <Space width="xs" />

              <Text style={[styles.timeBlock, {backgroundColor: color.gray_50, color: color.text_gray_medium}]}>{endTime.h}</Text>

              <Space width="xs" />

              <Text>:</Text>

              <Space width="xs" />

              <Text style={[styles.timeBlock, {backgroundColor: color.gray_50, color: color.text_gray_medium}]}>{endTime.m}</Text>

              <Space width="xs" />

              <Text>:</Text>

              <Space width="xs" />

              <Text style={[styles.timeBlock, {backgroundColor: color.gray_50, color: color.text_gray_medium}]}>{endTime.s}</Text>

              <Space width="xs" />
            </View>
          </View>
        </View>
      </View>
    </TitledCard>
  )
}

const messages = defineMessages({
  epochProgressTitle: {
    id: 'components.delegationsummary.epochProgress.title',
    defaultMessage: '!!!Epoch progress',
  },
  endsInLabel: {
    id: 'components.delegationsummary.epochProgress.endsIn',
    defaultMessage: '!!!Ends in',
  },
})

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    ...a.pr_sm,
    ...a.body_2_md_regular,
  },
  value: {
    ...a.body_2_md_regular,
  },
  timeWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  timeBlock: {
    ...a.body_1_lg_regular,
    ...a.px_2xs,
    ...a.text_center,
  },
})