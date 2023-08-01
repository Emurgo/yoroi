import {Balance, Swap} from '@yoroi/types'
import {asOpenswapAmount, asYoroiOrder, asYoroiTokenId} from './transformers'
import {Order} from '@yoroi/swap'

describe('asOpenswapAmount', () => {
  it('should return the correct result when a valid yoroiAmount is provided', () => {
    const yoroiAmount: Balance.Amount = {
      tokenId: 'policyid.assetname',
      quantity: '100',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '100',
      assetName: 'assetname',
      policyId: 'policyid',
    })
  })

  it('should handle primarty assetName and policyId correctly (empty)', () => {
    const yoroiAmount: Balance.Amount = {
      tokenId: '',
      quantity: '50',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '50',
      assetName: '',
      policyId: '',
    })
  })

  it('should handle yoroiAmount input correctly for nameless assets', () => {
    // Here, the tokenId does not contain a dot, so it's an invalid format
    const yoroiAmount: Balance.Amount = {
      tokenId: 'policyId',
      quantity: '75',
    }

    const result = asOpenswapAmount(yoroiAmount)

    expect(result).toEqual({
      amount: '75',
      assetName: '',
      policyId: 'policyId',
    })
  })
})

describe('asYoroiOrder', () => {
  it('should handle empty/filled tokenId correctly', () => {
    const openswapOrder: Order = {
      from: {token: '', amount: '75'},
      to: {token: 'tokenE.656565', amount: '150'},
      deposit: '100',
      utxo: 'utxo',
      provider: 'minswap',
    }

    const result = asYoroiOrder(openswapOrder)

    expect(result).toEqual<Swap.OpenOrder>({
      from: {
        quantity: '75',
        tokenId: '',
      },
      to: {
        quantity: '150',
        tokenId: 'tokenE.656565',
      },
      deposit: {
        quantity: '100',
        tokenId: '',
      },
      provider: 'minswap',
      utxo: 'utxo',
    })
  })
})

describe('asYoroiTokenId', () => {
  it('should return an empty string for an empty policyId', () => {
    const result = asYoroiTokenId({policyId: '', name: 'someName'})
    expect(result).toBe('')
  })

  it('should concatenate policyId and name when both are provided', () => {
    const result = asYoroiTokenId({policyId: 'somePolicyId', name: 'someName'})
    expect(result).toBe('somePolicyId.someName')
  })

  it('should return an empty string when name is an empty string', () => {
    const result = asYoroiTokenId({policyId: 'somePolicyId', name: ''})
    expect(result).toBe('somePolicyId.')
  })
})
