// @flow

// library borrowed from yoroi-frontend

import {CARDANO_CONFIG} from '../config'

const CONFIG = CARDANO_CONFIG.SHELLEY

export type ToAbsoluteSlotNumberRequest = {|
  epoch: number,
  slot: number,
|}
export type ToAbsoluteSlotNumberResponse = number
export type ToAbsoluteSlotNumberFunc = (
  request: ToAbsoluteSlotNumberRequest,
) => ToAbsoluteSlotNumberResponse

export function genToAbsoluteSlotNumber(): ToAbsoluteSlotNumberFunc {
  // TODO: Cardano in the future will have a variable epoch size
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: ToAbsoluteSlotNumberRequest) => {
    return CONFIG.SLOTS_PER_EPOCH * request.epoch + request.slot
  }
}

export type ToRelativeSlotNumberRequest = ToAbsoluteSlotNumberResponse
export type ToRelativeSlotNumberResponse = ToAbsoluteSlotNumberRequest
export type ToRelativeSlotNumberFunc = (
  request: ToRelativeSlotNumberRequest,
) => ToRelativeSlotNumberResponse
export function genToRelativeSlotNumber(): ToRelativeSlotNumberFunc {
  // TODO: Cardano in the future will have a variable epoch size
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (absoluteSlot: ToRelativeSlotNumberRequest) => {
    const epoch = Math.floor(absoluteSlot / CONFIG.SLOTS_PER_EPOCH)
    const slot = absoluteSlot % CONFIG.SLOTS_PER_EPOCH
    return {
      epoch,
      slot,
    }
  }
}

export type TimeToAbsoluteSlotRequest = {|
  time: Date,
|}
export type TimeToAbsoluteSlotResponse = {|
  slot: number,
  msIntoSlot: number,
|}
export type TimeToAbsoluteSlotFunc = (
  request: TimeToAbsoluteSlotRequest,
) => TimeToAbsoluteSlotResponse
export function genTimeToSlot(): TimeToAbsoluteSlotFunc {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: TimeToAbsoluteSlotRequest) => {
    const timeSinceGenesis = request.time.getTime() - CONFIG.BLOCK0_DATE
    const secondsSinceGenesis = timeSinceGenesis / 1000
    const totalSlots = Math.floor(secondsSinceGenesis / CONFIG.SLOT_DURATION)

    const msIntoSlot = timeSinceGenesis % 1000
    const secondsIntoSlot = secondsSinceGenesis % CONFIG.SLOT_DURATION
    return {
      slot: totalSlots,
      msIntoSlot: 1000 * secondsIntoSlot + msIntoSlot,
    }
  }
}

export type CurrentEpochLengthRequest = void
export type CurrentEpochLengthResponse = number
export type CurrentEpochLengthFunc = (
  request: CurrentEpochLengthRequest,
) => CurrentEpochLengthResponse
export function genCurrentEpochLength(): CurrentEpochLengthFunc {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (_request: CurrentEpochLengthRequest) => {
    return CONFIG.SLOTS_PER_EPOCH
  }
}

export type CurrentSlotLengthRequest = void
export type CurrentSlotLengthResponse = number
export type CurrentSlotLengthFunc = (
  request: CurrentSlotLengthRequest,
) => CurrentSlotLengthResponse
export function genCurrentSlotLength(): CurrentSlotLengthFunc {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (_request: CurrentSlotLengthRequest) => {
    return CONFIG.SLOT_DURATION
  }
}

export type TimeSinceGenesisRequest = {|
  absoluteSlot: number,
|}
export type TimeSinceGenesisResponse = number
export type TimeSinceGenesisRequestFunc = (
  request: TimeSinceGenesisRequest,
) => TimeSinceGenesisResponse
export function genTimeSinceGenesis(): TimeSinceGenesisRequestFunc {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: TimeSinceGenesisRequest) => {
    return CONFIG.SLOT_DURATION * request.absoluteSlot
  }
}

export type ToRealTimeRequest = {|
  absoluteSlotNum: number,
|}
export type ToRealTimeResponse = Date
export type ToRealTimeFunc = (request: ToRealTimeRequest) => ToRealTimeResponse
export function genToRealTime(): ToRealTimeFunc {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: ToRealTimeRequest) => {
    const secondsSinceStart = request.absoluteSlotNum * CONFIG.SLOT_DURATION
    const time = CONFIG.BLOCK0_DATE + 1000 * secondsSinceStart
    return new Date(time)
  }
}
