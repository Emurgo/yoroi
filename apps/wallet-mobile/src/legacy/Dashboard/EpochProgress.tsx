import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {ProgressCircle, Spacer, Text, TitledCard} from '../../components'
import {Space} from '../../components/Space/Space'

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
  const styles = useStyles()

  return (
    <TitledCard title={intl.formatMessage(messages.epochProgressTitle)} testID="epochProgressTitleCard">
      <View style={styles.wrapper}>
        <ProgressCircle percentage={percentage} />

        <Spacer width={40} />

        <View style={styles.stats}>
          <View style={styles.row}>
            <Text style={styles.label}>{intl.formatMessage(messages.epochProgressTitle)}:</Text>

            <Text style={styles.value}>{currentEpoch}</Text>
          </View>

          <Space height="sm" />

          <View style={styles.row}>
            <Text style={styles.label}>{intl.formatMessage(messages.endsInLabel)}:</Text>

            <View style={styles.timeWrapper}>
              {endTime.d != null && <Text style={styles.timeBlock}>{endTime.d}</Text>}

              <Space width="xs" />

              <Text style={styles.timeBlock}>{endTime.h}</Text>

              <Space width="xs" />

              <Text>:</Text>

              <Space width="xs" />

              <Text style={styles.timeBlock}>{endTime.m}</Text>

              <Space width="xs" />

              <Text>:</Text>

              <Space width="xs" />

              <Text style={styles.timeBlock}>{endTime.s}</Text>

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

const useStyles = () => {
  const {atoms, color} = useTheme()
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
      color: color.text_gray_medium,
      ...atoms.pr_sm,
      ...atoms.body_2_md_regular,
    },
    value: {
      ...atoms.body_2_md_regular,
      color: color.text_gray_normal,
    },
    timeWrapper: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    timeBlock: {
      ...atoms.body_1_lg_regular,
      ...atoms.px_2xs,
      ...atoms.text_center,
      backgroundColor: color.gray_c50,
      color: color.text_gray_normal,
    },
  })

  return styles
}
