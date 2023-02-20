export type TimeToAbsoluteSlotRequest = {
  time: number
}
export type TimeToAbsoluteSlotResponse = {
  slot: number
  msIntoSlot: number
}
export type TimeToAbsoluteSlotFunc = (request: TimeToAbsoluteSlotRequest) => TimeToAbsoluteSlotResponse

export function genTimeToSlot(
  config: Array<{
    StartAt?: number
    GenesisDate?: string
    SlotsPerEpoch?: number
    SlotDuration?: number
  }>,
): TimeToAbsoluteSlotFunc {
  return (request: TimeToAbsoluteSlotRequest) => {
    const {GenesisDate} = config[0]
    if (GenesisDate == null) {
      throw new Error('genTimeToSlot missing genesis params')
    }
    let SlotDuration = config[0].SlotDuration
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let timeLeftToTip = request.time - Number.parseInt(GenesisDate, 10)
    let slotCount = 0

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genTimeToSlot missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genTimeToSlot missing end')
        })()
      const numEpochs = end - start
      if (SlotDuration == null || SlotsPerEpoch == null) {
        throw new Error('genTimeToSlot missing params')
      }

      // queried time is before the next protocol parameter choice
      if (timeLeftToTip < SlotsPerEpoch * SlotDuration * 1000 * numEpochs) {
        break
      }
      slotCount += SlotsPerEpoch * numEpochs
      timeLeftToTip -= SlotsPerEpoch * SlotDuration * 1000 * numEpochs

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotDuration == null || SlotsPerEpoch == null) {
      throw new Error('genTimeToSlot missing params')
    }

    // find how many slots since the last update
    const secondsSinceLastUpdate = timeLeftToTip / 1000
    slotCount += Math.floor(secondsSinceLastUpdate / SlotDuration)

    const msIntoSlot = timeLeftToTip % 1000
    const secondsIntoSlot = secondsSinceLastUpdate % SlotDuration
    return {
      slot: slotCount,
      msIntoSlot: 1000 * secondsIntoSlot + msIntoSlot,
    }
  }
}
