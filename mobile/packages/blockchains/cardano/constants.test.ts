import {
  byronEraConfig,
  cardanoConfig,
  primaryTokenInfoAnyTestnet,
  primaryTokenInfoMainnet,
  protocolParamsPlaceholder,
  shelleyEraConfig,
  shelleyPreprodEraConfig,
} from './constants'

describe('Cardano constants', () => {
  describe('primaryTokenInfoMainnet', () => {
    it('should have correct ADA properties', () => {
      expect(primaryTokenInfoMainnet.decimals).toBe(6)
      expect(primaryTokenInfoMainnet.name).toBe('ADA')
      expect(primaryTokenInfoMainnet.ticker).toBe('ADA')
      expect(primaryTokenInfoMainnet.symbol).toBe('₳')
      expect(primaryTokenInfoMainnet.description).toBe('Cardano')
    })
  })

  describe('primaryTokenInfoAnyTestnet', () => {
    it('should have correct TADA properties', () => {
      expect(primaryTokenInfoAnyTestnet.decimals).toBe(6)
      expect(primaryTokenInfoAnyTestnet.name).toBe('TADA')
      expect(primaryTokenInfoAnyTestnet.ticker).toBe('TADA')
      expect(primaryTokenInfoAnyTestnet.symbol).toBe('₳')
      expect(primaryTokenInfoAnyTestnet.description).toBe('Cardano')
    })
  })

  describe('shelleyEraConfig', () => {
    it('should have correct shelley era configuration', () => {
      expect(shelleyEraConfig.name).toBe('shelley')
      expect(shelleyEraConfig.slotInSeconds).toBe(1)
      expect(shelleyEraConfig.slotsPerEpoch).toBe(432000)
      expect(shelleyEraConfig.start).toEqual(
        new Date('2020-07-29T21:44:51.000Z'),
      )
      expect(shelleyEraConfig.end).toEqual(new Date('2029-06-01T01:00:00.000Z'))
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(shelleyEraConfig)).toBe(true)
    })
  })

  describe('byronEraConfig', () => {
    it('should have correct byron era configuration', () => {
      expect(byronEraConfig.name).toBe('byron')
      expect(byronEraConfig.slotInSeconds).toBe(20)
      expect(byronEraConfig.slotsPerEpoch).toBe(21600)
      expect(byronEraConfig.start).toEqual(new Date('2017-09-23T21:44:51.000Z'))
      expect(byronEraConfig.end).toEqual(new Date('2020-07-29T21:44:51.000Z'))
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(byronEraConfig)).toBe(true)
    })
  })

  describe('shelleyPreprodEraConfig', () => {
    it('should have correct shelley preprod era configuration', () => {
      expect(shelleyPreprodEraConfig.name).toBe('shelley')
      expect(shelleyPreprodEraConfig.slotInSeconds).toBe(1)
      expect(shelleyPreprodEraConfig.slotsPerEpoch).toBe(432000)
      expect(shelleyPreprodEraConfig.start).toEqual(
        new Date('2022-06-01T01:00:00.000Z'),
      )
      expect(shelleyPreprodEraConfig.end).toEqual(
        new Date('2029-06-01T01:00:00.000Z'),
      )
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(shelleyPreprodEraConfig)).toBe(true)
    })
  })

  describe('protocolParamsPlaceholder', () => {
    it('should have correct protocol parameters structure', () => {
      expect(protocolParamsPlaceholder.linearFee).toBeDefined()
      expect(protocolParamsPlaceholder.coinsPerUtxoByte).toBe('4310')
      expect(protocolParamsPlaceholder.poolDeposit).toBe('500000000')
      expect(protocolParamsPlaceholder.keyDeposit).toBe('2000000')
      expect(protocolParamsPlaceholder.epoch).toBe(67)
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(protocolParamsPlaceholder)).toBe(true)
    })
  })

  describe('cardanoConfig', () => {
    it('should have correct denominations', () => {
      expect(cardanoConfig.denominations.lovelace).toBe(1)
      expect(cardanoConfig.denominations.ada).toBe(1_000_000n)
    })

    it('should have correct params', () => {
      expect(cardanoConfig.params.minUtxoValue).toBe(1_000_000n)
    })

    it('should have CIP1852 implementation', () => {
      expect(cardanoConfig.implementations['cardano-cip1852']).toBeDefined()
      expect(
        cardanoConfig.implementations['cardano-cip1852'].features.staking,
      ).toBeDefined()
      expect(
        cardanoConfig.implementations['cardano-cip1852'].derivations.base.roles
          .external,
      ).toBe(0)
      expect(
        cardanoConfig.implementations['cardano-cip1852'].derivations.base.roles
          .internal,
      ).toBe(1)
      expect(
        cardanoConfig.implementations['cardano-cip1852'].derivations.base.roles
          .staking,
      ).toBe(2)
    })

    it('should have BIP44 implementation', () => {
      expect(cardanoConfig.implementations['cardano-bip44']).toBeDefined()
      expect(
        cardanoConfig.implementations['cardano-bip44'].features.staking,
      ).toBe(false)
      expect(
        cardanoConfig.implementations['cardano-bip44'].derivations.base.roles
          .external,
      ).toBe(0)
      expect(
        cardanoConfig.implementations['cardano-bip44'].derivations.base.roles
          .internal,
      ).toBe(1)
    })

    it('should be frozen', () => {
      expect(Object.isFrozen(cardanoConfig)).toBe(true)
    })
  })
})
