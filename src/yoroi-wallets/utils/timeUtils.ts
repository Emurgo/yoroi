export type ToAbsoluteSlotNumberRequest = {
  epoch: number
  slot: number
}
export type ToAbsoluteSlotNumberResponse = number
export type ToAbsoluteSlotNumberFunc = (request: ToAbsoluteSlotNumberRequest) => ToAbsoluteSlotNumberResponse

export function genToAbsoluteSlotNumber(
  config: Array<{
    StartAt?: number
    SlotsPerEpoch?: number
  }>,
): ToAbsoluteSlotNumberFunc {
  return (request: ToAbsoluteSlotNumberRequest) => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let slotCount = 0
    let epochsLeft = request.epoch

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genToAbsoluteSlotNumber missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genToAbsoluteSlotNumber missing end')
        })()

      // queried time is before the next protocol parameter choice
      if (end > request.epoch) {
        break
      }
      const numEpochs = end - start

      if (SlotsPerEpoch == null) {
        throw new Error('genToAbsoluteSlotNumber missing params')
      }
      slotCount += SlotsPerEpoch * numEpochs
      epochsLeft -= numEpochs

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotsPerEpoch == null) {
      throw new Error('genToAbsoluteSlotNumber missing params')
    }

    // find how many slots in the epochs since the last update
    slotCount += SlotsPerEpoch * epochsLeft

    return slotCount + request.slot
  }
}

export type ToRelativeSlotNumberRequest = ToAbsoluteSlotNumberResponse
export type ToRelativeSlotNumberResponse = ToAbsoluteSlotNumberRequest
export type ToRelativeSlotNumberFunc = (request: ToRelativeSlotNumberRequest) => ToRelativeSlotNumberResponse
export function genToRelativeSlotNumber(
  config: Array<{
    StartAt?: number
    SlotsPerEpoch?: number
  }>,
): ToRelativeSlotNumberFunc {
  return (absoluteSlot: ToRelativeSlotNumberRequest) => {
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let epochCount = 0
    let slotsLeft = absoluteSlot

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genToRelativeSlotNumber missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genToRelativeSlotNumber end')
        })()
      const numEpochs = end - start

      if (SlotsPerEpoch == null) {
        throw new Error('genToRelativeSlotNumber params')
      }

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break
      }

      slotsLeft -= SlotsPerEpoch * numEpochs
      epochCount += numEpochs

      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotsPerEpoch == null) {
      throw new Error('genToAbsoluteSlotNumber:: missing params')
    }

    // find how many slots in the epochs since the last update
    epochCount += Math.floor(slotsLeft / SlotsPerEpoch)

    return {
      epoch: epochCount,
      slot: slotsLeft % SlotsPerEpoch,
    }
  }
}

export type TimeToAbsoluteSlotRequest = {
  time: Date
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
    let timeLeftToTip = request.time.getTime() - new Date(Number.parseInt(GenesisDate, 10)).getTime()
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

export type CurrentEpochLengthRequest = void
/** slots per epoch */
export type CurrentEpochLengthResponse = number
export type CurrentEpochLengthFunc = (request: CurrentEpochLengthRequest) => CurrentEpochLengthResponse
export function genCurrentEpochLength(
  config: Array<{
    SlotsPerEpoch?: number
  }>,
): CurrentEpochLengthFunc {
  return (_request: CurrentEpochLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {})
    return finalConfig.SlotsPerEpoch as number
  }
}

export type CurrentSlotLengthRequest = void
export type CurrentSlotLengthResponse = number
export type CurrentSlotLengthFunc = (request: CurrentSlotLengthRequest) => CurrentSlotLengthResponse
export function genCurrentSlotLength(
  config: Array<{
    SlotDuration?: number
  }>,
): CurrentSlotLengthFunc {
  return (_request: CurrentSlotLengthRequest) => {
    const finalConfig = config.reduce((acc, next) => Object.assign(acc, next), {})
    return finalConfig.SlotDuration as number
  }
}

export type TimeSinceGenesisRequest = {
  absoluteSlotNum: number
}
export type TimeSinceGenesisResponse = number /* seconds */
export type TimeSinceGenesisFunc = (request: TimeSinceGenesisRequest) => TimeSinceGenesisResponse
export function genTimeSinceGenesis(
  config: Array<{
    StartAt?: number
    GenesisDate?: string
    SlotsPerEpoch?: number
    SlotDuration?: number
  }>,
): TimeSinceGenesisFunc {
  return (request: TimeSinceGenesisRequest) => {
    let SlotDuration = config[0].SlotDuration
    let SlotsPerEpoch = config[0].SlotsPerEpoch
    let time = 0
    let slotsLeft = request.absoluteSlotNum

    // for pairs of config changes (x, x+1), get the time between these pairs
    for (let i = 0; i < config.length - 1; i++) {
      const start =
        config[i].StartAt ??
        (() => {
          throw new Error('genTimeSinceGenesis missing start')
        })()
      const end =
        config[i + 1].StartAt ??
        (() => {
          throw new Error('genTimeSinceGenesis missing end')
        })()
      const numEpochs = end - start

      if (SlotDuration == null || SlotsPerEpoch == null) {
        throw new Error('genTimeSinceGenesis missing params')
      }

      // queried time is before the next protocol parameter choice
      if (slotsLeft < SlotsPerEpoch * numEpochs) {
        break
      }
      time += SlotsPerEpoch * SlotDuration * numEpochs
      slotsLeft -= SlotsPerEpoch * numEpochs

      SlotDuration = config[i + 1].SlotDuration ?? SlotDuration
      SlotsPerEpoch = config[i + 1].SlotsPerEpoch ?? SlotsPerEpoch
    }

    if (SlotDuration == null || SlotsPerEpoch == null) {
      throw new Error('genTimeSinceGenesis:: missing params')
    }

    // add seconds into the current update
    time += slotsLeft * SlotDuration

    return time
  }
}

export type ToRealTimeRequest = {
  absoluteSlotNum: number
  timeSinceGenesisFunc: TimeSinceGenesisFunc
}
export type ToRealTimeResponse = Date
export type ToRealTimeFunc = (request: ToRealTimeRequest) => ToRealTimeResponse
export function genToRealTime(
  config: Array<{
    GenesisDate?: string
  }>,
): ToRealTimeFunc {
  return (request: ToRealTimeRequest) => {
    const {GenesisDate} = config[0]
    if (GenesisDate == null) {
      throw new Error('genToRealTime:: missing genesis start date')
    }

    const timeSinceGenesis = request.timeSinceGenesisFunc({
      absoluteSlotNum: request.absoluteSlotNum,
    })
    const time = new Date(Number.parseInt(GenesisDate, 10)).getTime() + 1000 * timeSinceGenesis
    return new Date(time)
  }
}
