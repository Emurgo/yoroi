import {Resolver} from '@yoroi/types'

import {nameServerName} from './constants'

describe('constants', () => {
  it('should have correct name server names', () => {
    expect(nameServerName[Resolver.NameServer.Cns]).toBe('CNS')
    expect(nameServerName[Resolver.NameServer.Unstoppable]).toBe(
      'Unstoppable Domains',
    )
    expect(nameServerName[Resolver.NameServer.Handle]).toBe('ADA Handle')
  })

})

