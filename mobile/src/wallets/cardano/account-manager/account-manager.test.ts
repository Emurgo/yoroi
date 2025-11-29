import {Address} from '@yoroi/types'

import {AddressChain, AddressGenerator} from './account-manager'

const getAddr = (i: number) => `Addr${i}` as Address

describe('AddressChain', () => {
  let chain: AddressChain | undefined
  let used: number[] = []
  const filterFn = (addrs: Address[]) =>
    Promise.resolve(addrs.filter((addr) => used.map(getAddr).includes(addr)))

  beforeEach(() => {
    used = []
    chain = new AddressChain(
      {
        generate: (ids) => ids.map(getAddr),
      } as AddressGenerator,
      5 /* block size */,
      2 /* gap limit */,
    )
  })

  it('starts with some addresses', () => {
    expect.assertions(1)
    chain?.initialize()
    expect(chain?.size()).toBe(5)
  })

  it('follows discovery', async () => {
    expect.assertions(5)
    used = []
    chain?.initialize()
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(5)

    used.push(1)
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(5)

    used.push(0)
    used.push(2)
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(5)

    used.push(3)
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(10)

    used.push(9)
    used.push(14)
    used.push(19)
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(25)
  })

  it('provides correct indexOf', async () => {
    expect.assertions(4)

    used = [4, 9]
    chain?.initialize()
    await chain?.sync(filterFn)
    expect(chain?.size()).toBe(15)
    expect(chain?.getIndexOfAddress(getAddr(4))).toBe(4)
    expect(chain?.getIndexOfAddress(getAddr(7))).toBe(7)
    expect(chain?.getIndexOfAddress(getAddr(14))).toBe(14)
  })

  it('can continue after rehydrating', async () => {
    const chainId = 1
    const pubKey44 =
        '7f53efa3c08093db3824235769079e96ef96b6680fc254f6c021ec420e4d1555' +
        'b5bafb0b1fc6c8040cc8f69f7c1948dfb4dcadec4acd09730c0efb39c6159362',
      chain = new AddressChain(
        new AddressGenerator(pubKey44, 1, 'cardano-bip44', chainId),
        5,
        2,
      )

    expect.assertions(2)

    chain.initialize()

    const data = chain.toJSON()
    const chain2 = AddressChain.fromJSON(data, 1)

    const used = [
      // '2cWKMJemoBaiAKW7iBFgK3prZAK3gAEgkndCUTkGpUAoRofmXJcbmie2qe6JTN44dQ2Ag', // byron testnet
      'Ae2tdPwUPEZ6ipzynAWN6atmb9LNqEogput2NrMD3Z8UL7phtQLDhrKt1bf', // byron mainnet
    ]

    const filter = (addresses: Address[]) => {
      return Promise.resolve(
        addresses.filter((addr) => used.includes(addr as string)),
      )
    }
    await chain.sync(filter)
    await chain2.sync(filter)
    expect(chain.size()).toBe(10)
    expect(chain2.addresses).toEqual(chain.addresses)
  })
})
