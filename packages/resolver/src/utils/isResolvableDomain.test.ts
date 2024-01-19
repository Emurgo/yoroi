import {isResolvableDomain} from './isResolvableDomain'

describe('isResolvableDomain', () => {
  it.each`
    resolve             | expected
    ${'ud.x'}           | ${true}
    ${'ud.polygon'}     | ${true}
    ${'ud.nft'}         | ${true}
    ${'ud.crypto'}      | ${true}
    ${'ud.blockchain'}  | ${true}
    ${'ud.bitcoin'}     | ${true}
    ${'ud.dao'}         | ${true}
    ${'ud.888'}         | ${true}
    ${'ud.wallet'}      | ${true}
    ${'ud.binanceus'}   | ${true}
    ${'ud.hi'}          | ${true}
    ${'ud.klever'}      | ${true}
    ${'ud.kresus'}      | ${true}
    ${'ud.anime'}       | ${true}
    ${'ud.manga'}       | ${true}
    ${'ud.go'}          | ${true}
    ${'ud.zil'}         | ${true}
    ${'ud.eth'}         | ${true}
    ${'$adahandle'}     | ${true}
    ${'cns.ada'}        | ${true}
    ${'ud.com'}         | ${false}
    ${'ud.unstoppable'} | ${false}
    ${'other.uk'}       | ${false}
    ${'$'}              | ${false}
  `('should return $expected for $resolve', ({resolve, expected}) => {
    expect(isResolvableDomain(resolve)).toBe(expected)
  })
})
