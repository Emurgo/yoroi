import {freeze} from 'immer'

import {NetworkConfig, NetworkEpochInfo} from '../types'

export function dateToEpochInfo(eras: NetworkConfig['eras']) {
  return (date: Date): Readonly<NetworkEpochInfo> => {
    let epochCount = 0

    for (const era of eras) {
      if (date >= era.start && (era.end === undefined || date <= era.end)) {
        const timeInEra = (date.getTime() - era.start.getTime()) / 1000
        const epochInEra = Math.floor(timeInEra / (era.slotInSeconds * era.slotsPerEpoch))
        const epochStart = new Date(era.start.getTime() + epochInEra * era.slotInSeconds * era.slotsPerEpoch * 1000)
        const epochEnd = new Date(epochStart.getTime() + era.slotsPerEpoch * era.slotInSeconds * 1000)

        return freeze({
          epoch: epochCount + epochInEra,
          start: epochStart,
          end: epochEnd,
          era: era,
        })
      }

      epochCount += Math.floor(
        (era.slotsPerEpoch *
          era.slotInSeconds *
          Math.ceil(
            (new Date(eras[eras.indexOf(era) + 1]?.start).getTime() - era.start.getTime()) /
              1000 /
              era.slotInSeconds /
              era.slotsPerEpoch,
          )) /
          (era.slotsPerEpoch * era.slotInSeconds),
      )
    }

    throw new Error('Date is before the start of the known eras')
  }
}
