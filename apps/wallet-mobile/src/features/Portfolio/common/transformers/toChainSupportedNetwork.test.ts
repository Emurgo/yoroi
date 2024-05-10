import {Chain} from '@yoroi/types'

import {toChainSupportedNetwork} from './toChainSupportedNetwork'

describe('toChainSupportedNetwork', () => {
  it('should return Chain.Network.Main for networkId 0', () => {
    expect(toChainSupportedNetwork(0)).toBe(Chain.Network.Mainnet)
  })

  it('should return Chain.Network.Main for networkId 1', () => {
    expect(toChainSupportedNetwork(1)).toBe(Chain.Network.Mainnet)
  })

  it('should return Chain.Network.Sancho for networkId 450', () => {
    expect(toChainSupportedNetwork(450)).toBe(Chain.Network.Sancho)
  })

  it('should return Chain.Network.Preprod for unknown networkId', () => {
    expect(toChainSupportedNetwork(999 as never)).toBe(Chain.Network.Preprod)
  })
})
