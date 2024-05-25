import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {ProgressCircle, Text, TitledCard} from '../../components'
import globalMessages from '../../kernel/i18n/global-messages'

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
    <View style={styles.wrapper}>
      <TitledCard title={intl.formatMessage(messages.epochProgressTitle)} testID="epochProgressTitleCard">
        <ProgressCircle percentage={percentage} />

        <View style={styles.stats}>
          <View style={styles.row}>
            <Text style={styles.label}>{intl.formatMessage(globalMessages.epochLabel)}:</Text>

            <Text style={styles.value}>{currentEpoch}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>{intl.formatMessage(messages.endsInLabel)}:</Text>

            <View style={styles.timeWrapper}>
              {endTime.d != null && <Text style={styles.timeBlock}>{endTime.d}</Text>}

              <Text style={styles.timeBlock}>{endTime.h}</Text>

              <Text>:</Text>

              <Text style={styles.timeBlock}>{endTime.m}</Text>

              <Text>:</Text>

              <Text style={styles.timeBlock}>{endTime.s}</Text>
            </View>
          </View>
        </View>
      </TitledCard>
    </View>
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
    wrapper: {},
    stats: {
      flex: 1,
      flexDirection: 'column',
      ...atoms.pl_lg,
      ...atoms.pb_sm,
      flexWrap: 'wrap',
    },
    row: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
    },
    label: {
      color: color.gray_c900,
      ...atoms.pr_md,
      ...atoms.body_2_md_regular,
    },
    value: {
      ...atoms.body_1_lg_regular,
      color: color.gray_c700,
    },
    timeWrapper: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
    },
    timeBlock: {
      ...atoms.body_1_lg_regular,
      ...atoms.py_xs,
      backgroundColor: color.gray_cmin,
      color: color.gray_c900,
      marginHorizontal: 4,
      borderRadius: 2,
      textAlign: 'center',
    },
  })

  return styles
}
