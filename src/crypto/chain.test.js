// @flow
import jestSetup from '../jestSetup'

import {AddressChainManager} from './chain'

jestSetup.setup()

const getAddr = (i) => `Addr${i}`

describe('AddressChainManager', () => {
  let chain

  beforeEach(() => {
    chain = new AddressChainManager(
      (ids) => ids.map(getAddr),
      5 /* block size */,
      7 /* gap limit */,
    )
  })

  it('starts with some addresses', () => {
    expect(chain.size()).toBe(10)
  })

  it('can check addresses', () => {
    expect(chain.isMyAddress(getAddr(0))).toBe(true)
    expect(chain.isMyAddress(getAddr(1))).toBe(true)
    expect(chain.isMyAddress(getAddr(9))).toBe(true)
    expect(chain.isMyAddress(getAddr(10))).toBe(false)
  })

  it('can mark as used twice', () => {
    chain.markAddressAsUsed(getAddr(7))
    chain.markAddressAsUsed(getAddr(7))
  })

  it('follows discovery', () => {
    chain.markAddressAsUsed(getAddr(7))
    expect(chain.size()).toBe(15)
    chain.markAddressAsUsed(getAddr(7))
    expect(chain.size()).toBe(15)
    chain.markAddressAsUsed(getAddr(14))
    expect(chain.size()).toBe(25)
  })

  it('throws on bad used', () => {
    expect(() => {
      chain.markAddressAsUsed('wrong')
    }).toThrow()
  })

  it('provides correct indexOf', () => {
    expect(chain.getIndexOfAddress(getAddr(4))).toBe(4)
    expect(chain.getIndexOfAddress(getAddr(7))).toBe(7)
    chain.markAddressAsUsed(getAddr(7))
    expect(chain.getIndexOfAddress(getAddr(14))).toBe(14)
  })

  it('throws on bad indexOf', () => {
    expect(() => {
      chain.getIndexOfAddress('wrong')
    }).toThrow()
  })

  it('provides correct block count', () => {
    expect(chain.getBlockCount()).toBe(2)
    chain.markAddressAsUsed(getAddr(7))
    expect(chain.getBlockCount()).toBe(3)
  })
  it('provides correct blocks', () => {
    expect(chain.getBlocks()[0][0]).toBe(0)
    expect(chain.getBlocks()[0][2]).toEqual([
      getAddr(0),
      getAddr(1),
      getAddr(2),
      getAddr(3),
      getAddr(4),
    ])
    expect(chain.getBlocks()[1][0]).toBe(1)
  })
})
