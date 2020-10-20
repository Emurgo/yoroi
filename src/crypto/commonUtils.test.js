// @flow
import jestSetup from '../jestSetup'

import {isValidAddress, addressToDisplayString, formatPath} from './commonUtils'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../config/types'

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
]

describe('address handling', () => {
  it('should parse valid addresses', async () => {
    expect.assertions(1)

    const legacyAddr =
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4'
    expect(await addressToDisplayString(legacyAddr)).toEqual(
      'Ae2tdPwUPEZKX8N2TjzBXLy5qrecnQUniTd2yxE8mWyrh2djNpUkbAtXtP4',
    )
  })

  it('can validate valid addresses', async () => {
    expect.assertions(3)
    const byronAddrs = validAddresses.slice(0, 2)
    for (const address of byronAddrs) {
      const isValid = await isValidAddress(address.addr, address.isJormungandr)
      expect(isValid).toBe(true)
    }
    const promise = isValidAddress(
      validAddresses[2].addr,
      validAddresses[2].isJormungandr,
    )
    await expect(promise).rejects.not.toBeNull()
  })
})

test('Can format address', () => {
  expect(
    formatPath(
      42,
      'Internal',
      47,
      WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON,
    ),
  ).toBe("m/44'/1815'/42'/1/47")
  expect(
    formatPath(
      42,
      'Internal',
      47,
      WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY,
    ),
  ).toBe("m/1852'/1815'/42'/1/47")
  expect(
    formatPath(
      42,
      'Internal',
      47,
      WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24,
    ),
  ).toBe("m/1852'/1815'/42'/1/47")
})
