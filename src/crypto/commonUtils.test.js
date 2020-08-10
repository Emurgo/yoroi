// @flow
import jestSetup from '../jestSetup'

import {isValidAddress, addressToDisplayString} from './commonUtils'

jestSetup.setup()

const validAddresses = [
  {
    addr: 'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    isJormungandr: false,
  },
  {
    addr: 'Ae2tdPwUPEZ4xAL3nxLq4Py7BfS1D2tJ3u2rxZGnrAXC8TNkWhTaz41J3FN',
    isJormungandr: false,
  },
  {
    addr: 'addr1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqd6r42j',
    isJormungandr: true,
  },
  {
    addr: 'ca1sw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguq9rance',
    isJormungandr: true,
  },
]

describe('address handling', () => {
  it('should parse valid addresses', async () => {
    expect.assertions(2)

    const legacyAddr =
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'
    expect(await addressToDisplayString(legacyAddr)).toEqual(
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    )

    const bech32Addr =
      '038fb03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbfd8800b51c0'
    expect(await addressToDisplayString(bech32Addr)).toEqual(
      'addr1qw8mq0p65pf028qgd32t6szeatfd9epx4jyl5jeuuswtlkyqpdguqd6r42j',
    )
  })

  it('can validate valid addresses', async () => {
    expect.assertions(validAddresses.length)
    for (const address of validAddresses) {
      const isValid = await isValidAddress(address.addr, address.isJormungandr)
      expect(isValid).toBe(true)
    }
  })
})
