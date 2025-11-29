import {
  cardanoScheme,
  configCardanoAddressV1,
  configCardanoBlockV1,
  configCardanoBrowseV1,
  configCardanoClaimV1,
  configCardanoConnectV1,
  configCardanoLegacyTransfer,
  configCardanoPayV1,
  configCardanoPaymentV1,
  configCardanoStakeV1,
  configCardanoTransactionV1,
  configCardanoWalletV1,
} from './constants'

describe('cardano constants', () => {
  it('should have correct cardanoScheme', () => {
    expect(cardanoScheme).toBe('web+cardano')
  })

  it('should have correct configCardanoClaimV1', () => {
    expect(configCardanoClaimV1.scheme).toBe('web+cardano')
    expect(configCardanoClaimV1.authority).toBe('claim')
    expect(configCardanoClaimV1.version).toBe('v1')
    expect(configCardanoClaimV1.rules.requiredParams).toEqual([
      'code',
      'faucet_url',
    ])
    expect(configCardanoClaimV1.rules.extraParams).toBe('include')
  })

  it('should have correct configCardanoLegacyTransfer', () => {
    expect(configCardanoLegacyTransfer.scheme).toBe('web+cardano')
    expect(configCardanoLegacyTransfer.authority).toBe('')
    expect(configCardanoLegacyTransfer.version).toBe('')
    expect(configCardanoLegacyTransfer.rules.requiredParams).toEqual([
      'address',
    ])
    expect(configCardanoLegacyTransfer.rules.extraParams).toBe('drop')
  })

  it('should have correct configCardanoBrowseV1', () => {
    expect(configCardanoBrowseV1.authority).toBe('browse')
    expect(configCardanoBrowseV1.rules.requiredParams).toEqual([
      'scheme',
      'namespaced_domain',
    ])
  })

  it('should have correct configCardanoPayV1', () => {
    expect(configCardanoPayV1.authority).toBe('pay')
    expect(configCardanoPayV1.rules.requiredParams).toEqual(['address'])
    expect(configCardanoPayV1.rules.optionalParams).toEqual([
      'amount',
      'asset',
      'memo',
    ])
  })

  it('should have correct configCardanoPaymentV1', () => {
    expect(configCardanoPaymentV1.authority).toBe('payment')
    expect(configCardanoPaymentV1.rules.requiredParams).toEqual(['address'])
  })

  it('should have correct configCardanoStakeV1', () => {
    expect(configCardanoStakeV1.authority).toBe('stake')
    expect(configCardanoStakeV1.rules.requiredParams).toEqual(['pool'])
  })

  it('should have correct configCardanoTransactionV1', () => {
    expect(configCardanoTransactionV1.authority).toBe('transaction')
    expect(configCardanoTransactionV1.rules.requiredParams).toEqual(['hash'])
  })

  it('should have correct configCardanoBlockV1', () => {
    expect(configCardanoBlockV1.authority).toBe('block')
    expect(configCardanoBlockV1.rules.optionalParams).toEqual([
      'hash',
      'height',
    ])
  })

  it('should have correct configCardanoAddressV1', () => {
    expect(configCardanoAddressV1.authority).toBe('address')
    expect(configCardanoAddressV1.rules.requiredParams).toEqual(['address'])
  })

  it('should have correct configCardanoConnectV1', () => {
    expect(configCardanoConnectV1.authority).toBe('connect')
    expect(configCardanoConnectV1.rules.requiredParams).toEqual(['dappPeer'])
    expect(configCardanoConnectV1.rules.optionalParams).toEqual([
      'host',
      'port',
      'path',
      'secure',
    ])
  })

  it('should have correct configCardanoWalletV1', () => {
    expect(configCardanoWalletV1.authority).toBe('wallet')
    expect(configCardanoWalletV1.rules.requiredParams).toEqual(['type'])
    expect(configCardanoWalletV1.rules.optionalParams).toContain('mnemonic')
    expect(configCardanoWalletV1.rules.optionalParams).toContain('rootKey')
  })

  it('should be frozen', () => {
    expect(Object.isFrozen(configCardanoClaimV1)).toBe(true)
    expect(Object.isFrozen(configCardanoLegacyTransfer)).toBe(true)
    expect(Object.isFrozen(configCardanoBrowseV1)).toBe(true)
    expect(Object.isFrozen(configCardanoPayV1)).toBe(true)
    expect(Object.isFrozen(configCardanoPaymentV1)).toBe(true)
    expect(Object.isFrozen(configCardanoStakeV1)).toBe(true)
    expect(Object.isFrozen(configCardanoTransactionV1)).toBe(true)
    expect(Object.isFrozen(configCardanoBlockV1)).toBe(true)
    expect(Object.isFrozen(configCardanoAddressV1)).toBe(true)
    expect(Object.isFrozen(configCardanoConnectV1)).toBe(true)
    expect(Object.isFrozen(configCardanoWalletV1)).toBe(true)
  })
})
