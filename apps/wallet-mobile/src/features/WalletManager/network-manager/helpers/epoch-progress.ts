import {Network} from '@yoroi/types'
import {freeze} from 'immer'

export function epochProgress(epochInfo: Network.EpochInfo) {
  return (date: Date) => {
    const epochStart = epochInfo.start
    const epochEnd = epochInfo.end

    if (date > epochEnd || date < epochStart)
      return freeze(
        {
          progress: 100,
          currentSlot: epochInfo.era.slotsPerEpoch,
          timeRemaining: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          },
        },
        true,
      )

    const progress =
      Math.round(
        Math.min(((date.getTime() - epochStart.getTime()) / (epochEnd.getTime() - epochStart.getTime())) * 100, 100) *
          100,
      ) / 100
    const currentSlot = Math.floor((date.getTime() - epochStart.getTime()) / 1e3 / epochInfo.era.slotInSeconds)
    const timeRemainingSeconds = (epochEnd.getTime() - date.getTime()) / 1e3

    const days = Math.floor(timeRemainingSeconds / (24 * 3_600))
    const hours = Math.floor((timeRemainingSeconds % (24 * 3_600)) / 3_600)
    const minutes = Math.floor((timeRemainingSeconds % 3_600) / 60)
    const seconds = Math.floor(timeRemainingSeconds % 60)

    return freeze(
      {
        progress: progress,
        currentSlot: currentSlot,
        timeRemaining: {
          days: days,
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        },
      },
      true,
    )
  }
}
