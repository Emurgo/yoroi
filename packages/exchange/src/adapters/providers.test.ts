import {Exchange} from '@yoroi/types'
import {Providers} from './providers'

describe('Providers Configuration', () => {
  it('exists', () => {
    const banxaConfig = Exchange.Provider.Banxa
    const encryptusConfig = Exchange.Provider.Encryptus

    expect(Providers[banxaConfig]).toBeDefined()
    expect(Providers[encryptusConfig]).toBeDefined()
  })
})
