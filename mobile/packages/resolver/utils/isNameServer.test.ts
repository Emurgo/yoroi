import {Resolver} from '@yoroi/types'

import {isNameServer} from './isNameServer'

describe('isNameServer', () => {
  it.each`
    nameServer                         | expected
    ${Resolver.NameServer.Cns}         | ${true}
    ${Resolver.NameServer.Handle}      | ${true}
    ${Resolver.NameServer.Unstoppable} | ${true}
    ${'whatever-domains'}              | ${false}
  `('should return $expected for $domain', ({nameServer, expected}) => {
    expect(isNameServer(nameServer)).toBe(expected)
  })
})
