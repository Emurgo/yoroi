import {isCIP1852AccountPath, isValidPath} from './bip44Validators'

describe('Check BIP44/CIP1852 paths', () => {
  it('valid CIP1852 paths', () => {
    const account0 = [1852, 1815, 0]
    expect(isCIP1852AccountPath(account0)).toEqual(true)

    const account0Hardened = [2147485500, 2147485463, 2147483648]
    expect(isCIP1852AccountPath(account0Hardened)).toEqual(true)

    const lastAccount = [2147485500, 2147485463, 4294967295]
    expect(isCIP1852AccountPath(lastAccount)).toEqual(true)
  })

  it('invalid CIP1852 paths', () => {
    const bip44Path = [2147483692, 2147485463, 2147483648]
    expect(isCIP1852AccountPath(bip44Path)).toEqual(false)

    const nonHardened = [2147483692, 2147485463, 0]
    expect(isCIP1852AccountPath(nonHardened)).toEqual(false)
  })

  it('invalid BIP44 paths', () => {
    const paths = [undefined, '', [], {}, [2147483692, 2147485463, 2147483648, 2147483692, 2147483692, 2147483692]]
    for (const path of paths) {
      expect(isValidPath(path)).toEqual(false)
    }
  })
})
