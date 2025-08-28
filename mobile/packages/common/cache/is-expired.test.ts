import {isExpired} from './is-expired'

const tenSeconds = 10 * 1000
describe('isExpired', () => {
  it.each`
    description                     | cacheInfo                                                   | expected
    ${'expired cache'}              | ${{expires: Date.now() - tenSeconds, hash: 'hash'}}         | ${true}
    ${'not expired cache'}          | ${{expires: Date.now() + tenSeconds, hash: 'hash'}}         | ${false}
    ${'expired cache as tuple'}     | ${[null, {expires: Date.now() - tenSeconds, hash: 'hash'}]} | ${true}
    ${'not expired cache as tuple'} | ${[null, {expires: Date.now() + tenSeconds, hash: 'hash'}]} | ${false}
  `('should return $expected if $description', ({expected, cacheInfo}) => {
    expect(isExpired(cacheInfo)).toBe(expected)
  })
})
