import {GENESIS_DATE} from '../constants/mainnet/constants'
import {getTime} from './getTime'

describe('getTime', () => {
  test('genesis', () => {
    expect(getTime(Number(GENESIS_DATE))).toEqual({
      absoluteSlot: 0,
      epoch: 0,
      percentageElapsed: 0,
      secondsRemainingInEpoch: 432000,
      slot: 0,
      slotsPerEpoch: 432000,
      slotsRemaining: 432000,
    })
  })

  test('recent', () => {
    expect(getTime(1677859888202)).toEqual({
      absoluteSlot: 171656797,
      epoch: 397,
      percentageElapsed: 35,
      secondsRemainingInEpoch: 279203,
      slot: 152797,
      slotsPerEpoch: 432000,
      slotsRemaining: 279203,
    })
  })
})
