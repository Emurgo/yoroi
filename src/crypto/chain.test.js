// @flow
import jestSetup from '../jestSetup'

import {AddressChain} from './chain'

jestSetup.setup()

const getAddr = (i) => `Addr${i}`

describe('AddressChain', () => {
  let chain
  let used

  beforeEach(() => {
    used = []
    chain = new AddressChain(
      (ids) => Promise.resolve(ids.map(getAddr)),
      (addrs) =>
        Promise.resolve(
          addrs.filter((addr) => used.map(getAddr).includes(addr)),
        ),
      5 /* block size */,
      2 /* gap limit */,
    )
  })

  it('starts with some addresses', async () => {
    expect.assertions(1)
    await chain.initialize()
    expect(chain.size()).toBe(5)
  })

  it('follows discovery', async () => {
    expect.assertions(5)
    used = []
    await chain.initialize()
    await chain.sync()
    expect(chain.size()).toBe(5)

    used.push(1)
    await chain.sync()
    expect(chain.size()).toBe(5)

    used.push(0)
    used.push(2)
    await chain.sync()
    expect(chain.size()).toBe(5)

    used.push(3)
    await chain.sync()
    expect(chain.size()).toBe(10)

    used.push(9)
    used.push(14)
    used.push(19)
    await chain.sync()
    expect(chain.size()).toBe(25)
  })

  it('provides correct indexOf', async () => {
    expect.assertions(4)

    used = [4, 9]
    await chain.initialize()
    await chain.sync()
    expect(chain.size()).toBe(15)
    expect(chain.getIndexOfAddress(getAddr(4))).toBe(4)
    expect(chain.getIndexOfAddress(getAddr(7))).toBe(7)
    expect(chain.getIndexOfAddress(getAddr(14))).toBe(14)
  })

  it('throws on bad indexOf', async () => {
    expect.assertions(1)

    await chain.initialize()
    expect(() => {
      chain.getIndexOfAddress('wrong')
    }).toThrow()
  })
})
