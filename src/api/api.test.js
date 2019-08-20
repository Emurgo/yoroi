// @flow
/* eslint-env jest */
import jestSetup from '../jestSetup'

import moment from 'moment'

import {ApiError} from './errors'

jestSetup.setup()
jest.setTimeout(30 * 1000)

let apiWithTestnet

describe('History API', () => {
  // We have to mock config before importing api so it propagates in it
  jest.setMock('react-native-config', {USE_TESTNET: true})
  apiWithTestnet = require('./api')
  it('can fetch history', async () => {
    const addresses = [
      '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
    ]
    const ts = moment('1970-01-01')

    // We are async
    expect.assertions(1)
    const result = await apiWithTestnet.fetchNewTxHistory(ts, addresses)

    // $FlowFixMe it seems like toMatchSnapshot is badly typed
    expect(result.transactions[0]).toMatchSnapshot({
      bestBlockNum: expect.any(Number),
    })
  })

  it('throws ApiError on bad request', async () => {
    const addresses = []
    // mock moment
    const ts = {toISOString: () => 'not-a-date'}

    // We are async
    expect.assertions(1)

    await expect(
      apiWithTestnet.fetchNewTxHistory(ts, addresses),
      // $FlowFixMe not sure why Flow does not like ApiError instead of Error
    ).rejects.toThrow(ApiError)
  })

  it('filters used addresses', async () => {
    const addresses = [
      '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
      '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
      '2cWKMJemoBahVMF121P6j54LjjKua29QGK6RpXZkxfaBLHExkGDuJ25wcC8vc2ExfuzLp',
    ]
    const used = [
      '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
      '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
    ]

    expect.assertions(1)
    const result = await apiWithTestnet.filterUsedAddresses(addresses)
    expect(result).toEqual(used)
  })

  it('keeps order in filterUsedAddresses', async () => {
    const addresses = [
      '2cWKMJemoBakWtKxxsZpnEhs3ZWRf9tG3R9ReJX6UsAGiZP7PBpmutxYPRAakqEgMsK1g',
      '2cWKMJemoBahkhQS5QofBQxmsQMQDTxv1xzzqU9eHXBx6aDxaswBEksqurrfwhMNTYVFK',
    ]

    expect.assertions(2)

    const result1 = await apiWithTestnet.filterUsedAddresses(addresses)
    expect(result1).toEqual(addresses)

    addresses.reverse()

    const result2 = await apiWithTestnet.filterUsedAddresses(addresses)
    expect(result2).toEqual(addresses)
  })
})
