import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {StyleSheet} from 'react-native'

import {ProgressCircle, Text, TitledCard} from '../components'
import globalMessages from '../i18n/global-messages'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'

export const EpochProgress = () => {
  const intl = useIntl()
  const currentTime = useCurrentTime()
  const wallet = useSelectedWallet()

  const {currentEpoch, slotsRemaining, secondsRemainingInEpoch, percentageElapsed} =
    wallet.networkInfo.getTime(currentTime)

  const timeLeftInEpoch = new Date(secondsRemainingInEpoch * 1000)

  const endTime = {
    d: leftPadDate(Math.floor(slotsRemaining / (3600 * 24))),
    h: leftPadDate(timeLeftInEpoch.getUTCHours()),
    m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
    s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
  }

  return (
    <View style={styles.wrapper}>
      <TitledCard title={intl.formatMessage(messages.epochProgressTitle)} testID="epochProgressTitleCard">
        <ProgressCircle percentage={percentageElapsed} />

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

const styles = StyleSheet.create({
  wrapper: {},
  stats: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 18,
    paddingBottom: 10,
    flexWrap: 'wrap',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  label: {
    color: COLORS.GRAY,
    paddingRight: 12,
    lineHeight: 24,
    fontSize: 14,
  },
  value: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  timeWrapper: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  timeBlock: {
    lineHeight: 24,
    fontSize: 16,
    color: COLORS.DARK_TEXT,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    borderRadius: 2,
    backgroundColor: COLORS.BANNER_GREY,
    textAlign: 'center',
  },
})

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000)

    return () => clearInterval(id)
  }, [])

  return currentTime
}

const leftPadDate = (num: number) => {
  if (num < 10) return `0${num}`
  return num.toString()
}