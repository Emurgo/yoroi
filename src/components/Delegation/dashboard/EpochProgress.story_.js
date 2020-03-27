// @flow

import React from 'react'

import {storiesOf} from '@storybook/react-native'

import EpochProgress from './EpochProgress'
import {
  genToRelativeSlotNumber,
  genCurrentEpochLength,
  genCurrentSlotLength,
  genTimeToSlot,
} from '../../../helpers/timeUtils'

const toRelativeSlotNumber = genToRelativeSlotNumber()
const timeToSlot = genTimeToSlot()

const currentAbsoluteSlot = timeToSlot({
  time: new Date(),
})

const currentRelativeTime = toRelativeSlotNumber(
  timeToSlot({
    time: new Date(),
  }).slot,
)
const epochLength = genCurrentEpochLength()()
const slotLength = genCurrentSlotLength()()

const secondsLeftInEpoch = (epochLength - currentRelativeTime.slot) * slotLength
const timeLeftInEpoch = new Date(
  1000 * secondsLeftInEpoch - currentAbsoluteSlot.msIntoSlot,
)

const leftPadDate: (number) => string = (num) => {
  if (num < 10) return `0${num}`
  return num.toString()
}

storiesOf('EpochProgress', module).add('default', () => (
  <EpochProgress
    percentage={Math.floor((100 * currentRelativeTime.slot) / epochLength)}
    currentEpoch={currentRelativeTime.epoch}
    endTime={{
      h: leftPadDate(timeLeftInEpoch.getUTCHours()),
      m: leftPadDate(timeLeftInEpoch.getUTCMinutes()),
      s: leftPadDate(timeLeftInEpoch.getUTCSeconds()),
    }}
  />
))
