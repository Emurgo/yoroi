import {NetworkEpochInfo} from '../types'

export function epochProgress(epochInfo: NetworkEpochInfo) {
  return (date: Date) => {
    const epochStart = epochInfo.start
    const epochEnd = epochInfo.end

    if (date > epochEnd || date < epochStart) throw new Error('Date is out of the current epoch')

    const progress = Math.min(
      ((date.getTime() - epochStart.getTime()) / (epochEnd.getTime() - epochStart.getTime())) * 100,
      100,
    )
    const currentSlot = Math.floor((date.getTime() - epochStart.getTime()) / 1e3 / epochInfo.era.slotInSeconds)
    const timeRemainingSeconds = (epochEnd.getTime() - date.getTime()) / 1e3

    const days = Math.floor(timeRemainingSeconds / (24 * 3_600))
    const hours = Math.floor((timeRemainingSeconds % (24 * 3_600)) / 3_600)
    const minutes = Math.floor((timeRemainingSeconds % 3_600) / 60)
    const seconds = Math.floor(timeRemainingSeconds % 60)

    return {
      progress: progress,
      currentSlot: currentSlot,
      timeRemaining: {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      },
    }
  }
}
