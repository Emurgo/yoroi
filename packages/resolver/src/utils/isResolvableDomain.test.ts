import {isResolvableDomain} from './isResolvableDomain'

describe('isResolvableDomain', () => {
  it.each`
    receiver            | expected
    ${'ud.com'}         | ${true}
    ${'ud.eth'}         | ${true}
    ${'ud.crypto'}      | ${true}
    ${'ud.zil'}         | ${true}
    ${'ud.bitcoin'}     | ${true}
    ${'ud.blockchain'}  | ${true}
    ${'ud.go'}          | ${true}
    ${'ud.888'}         | ${true}
    ${'ud.dao'}         | ${true}
    ${'ud.polygon'}     | ${true}
    ${'ud.wallet'}      | ${true}
    ${'ud.nft'}         | ${true}
    ${'ud.x'}           | ${true}
    ${'ud.unstoppable'} | ${true}
    ${'$adahandle'}     | ${true}
    ${'cns.ada'}        | ${true}
    ${'other.uk'}       | ${false}
  `('should return $expected for $domain', ({receiver, expected}) => {
    expect(isResolvableDomain(receiver)).toBe(expected)
  })
})
