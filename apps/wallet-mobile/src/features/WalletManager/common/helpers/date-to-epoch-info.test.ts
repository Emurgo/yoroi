import {byronEraConfig, networkManager, shelleyEraConfig, shelleyPreprodEraConfig} from '../network-manager'
import {dateToEpochInfo} from './date-to-epoch-info'

describe('dateToEpochInfo', () => {
  it('should return the correct epoch information', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['mainnet'].eras)

    const inputDate = new Date('2024-05-14T12:30:00Z')
    const expectedOutput = {
      epoch: 484,
      start: new Date('2024-05-09T21:44:51.000Z'),
      end: new Date('2024-05-14T21:44:51.000Z'),
      era: shelleyEraConfig,
    }

    const result = convertDateToEpoch(inputDate)

    expect(result).toEqual(expectedOutput)
  })

  it('should throw an error for a date before the start of the known eras', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['mainnet'].eras)

    const inputDate = new Date('1998-12-31T23:59:59Z')

    expect(() => convertDateToEpoch(inputDate)).toThrow('Date is before the start of the known eras')
  })

  it('should return the first byron epoch - 0', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['mainnet'].eras)

    const inputDate = new Date(1506203091000)
    const expectedOutput = {
      epoch: 0,
      start: new Date('2017-09-23T21:44:51.000Z'),
      end: new Date('2017-09-28T21:44:51.000Z'),
      era: byronEraConfig,
    }

    const result = convertDateToEpoch(inputDate)

    expect(result).toEqual(expectedOutput)
  })

  it('should return the last byron epoch - 207', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['mainnet'].eras)

    const inputDate = new Date('2020-07-29T21:44:50.000Z')
    const expectedOutput = {
      epoch: 207,
      start: new Date('2020-07-24T21:44:51.000Z'),
      end: new Date('2020-07-29T21:44:51.000Z'),
      era: byronEraConfig,
    }

    const result = convertDateToEpoch(inputDate)

    expect(result).toEqual(expectedOutput)
  })

  it('should return the first shelley epoch - 208', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['mainnet'].eras)

    const inputDate = new Date('2020-07-29T21:44:51.000Z')

    const expectedOutput = {
      epoch: 208,
      start: new Date('2020-07-29T21:44:51.000Z'),
      end: new Date('2020-08-03T21:44:51.000Z'),
      era: shelleyEraConfig,
    }

    const result = convertDateToEpoch(inputDate)

    expect(result).toEqual(expectedOutput)
  })

  it('should return the correct epoch information - preprod', () => {
    const convertDateToEpoch = dateToEpochInfo(networkManager['preprod'].eras)

    const inputDate = new Date('2024-05-14T15:09:00.000Z')
    const expectedOutput = {
      epoch: 142,
      start: new Date('2024-05-11T01:00:00.000Z'),
      end: new Date('2024-05-16T01:00:00.000Z'),
      era: shelleyPreprodEraConfig,
    }

    const result = convertDateToEpoch(inputDate)

    expect(result).toEqual(expectedOutput)
  })
})
