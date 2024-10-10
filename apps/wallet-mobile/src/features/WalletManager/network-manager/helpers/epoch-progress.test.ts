import {buildPortfolioTokenManagers} from '../../../Portfolio/common/helpers/build-token-managers'
import {epochProgress} from '../helpers/epoch-progress'
import {buildNetworkManagers, shelleyEraConfig} from '../network-manager'
import {dateToEpochInfo} from './date-to-epoch-info'

describe('epochProgress', () => {
  // TODO: should be mocked
  const networkManagers = buildNetworkManagers({
    tokenManagers: buildPortfolioTokenManagers().tokenManagers,
  })
  it('should calculate epoch progress correctly last second', () => {
    const currentDate = new Date('2024-05-14T21:44:50.000Z')
    const result = epochProgress(dateToEpochInfo(networkManagers['mainnet'].eras)(currentDate))(currentDate)

    expect(result).toEqual({
      progress: 100,
      currentSlot: 431999,
      absoluteSlot: 124156799,
      timeRemaining: {days: 0, hours: 0, minutes: 0, seconds: 1},
    })
  })

  it('should calculate epoch progress correctly first second', () => {
    const currentDate = new Date('2024-05-09T21:44:51.000Z')
    const result = epochProgress(dateToEpochInfo(networkManagers['mainnet'].eras)(currentDate))(currentDate)

    expect(result).toEqual({
      absoluteSlot: 123724800,
      progress: 0,
      currentSlot: 0,
      timeRemaining: {days: 5, hours: 0, minutes: 0, seconds: 0},
    })
  })

  it('should calculate epoch progress correctly half way', () => {
    const currentDate = new Date('2024-05-12T09:44:51.000Z')
    const result = epochProgress(dateToEpochInfo(networkManagers['mainnet'].eras)(currentDate))(currentDate)

    expect(result).toEqual({
      absoluteSlot: 123940800,
      progress: 50,
      currentSlot: 216000,
      timeRemaining: {days: 2, hours: 12, minutes: 0, seconds: 0},
    })
  })

  it('should handle date out of the current epoch', () => {
    const epochInfo = {
      epoch: 484,
      start: new Date('2024-05-09T21:44:51.000Z'),
      end: new Date('2024-05-14T21:44:51.000Z'),
      era: shelleyEraConfig,
      eras: networkManagers['mainnet'].eras,
    }

    const currentDate = new Date('2022-01-02T00:00:01Z')
    const progressFn = epochProgress(epochInfo)
    const result = progressFn(currentDate)

    expect(result).toEqual({
      progress: 100,
      currentSlot: 432000,
      absoluteSlot: 49515310,
      timeRemaining: {days: 0, hours: 0, minutes: 0, seconds: 0},
    })
  })

  it('should handle date before the start of the current epoch', () => {
    const currentDate = new Date('2024-05-15T09:00:00.000Z')
    const epochPreprodInfo = dateToEpochInfo(networkManagers['preprod'].eras)(currentDate)

    const progressFn = epochProgress(epochPreprodInfo)
    const result = progressFn(currentDate)

    expect(result).toEqual({
      absoluteSlot: 61718400,
      progress: 86.67,
      currentSlot: 374400,
      timeRemaining: {days: 0, hours: 16, minutes: 0, seconds: 0},
    })
  })
})
