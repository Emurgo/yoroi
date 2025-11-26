import {Balance} from '@yoroi/types'

import {BigNumber} from 'bignumber.js'

import {RemoteUnspentOutput} from '../types'
import type {SendToken} from '../types'
import {
  ASCII_ASSET_NAME_BLACKLIST,
  amountsFromRemote,
  buildSendTokenList,
  cardanoAssetToIdentifier,
  identifierToCardanoAsset,
  parseTokenList,
  resolveCip67Tag,
} from './assets'

describe('assets utils', () => {
  describe('amountsFromRemote', () => {
    it('should return balance from RemoteUnspentOutput', () => {
      const utxo: RemoteUnspentOutput = {
        receiver: 'addr_test1',
        txHash: 'hash1',
        txIndex: 0,
        utxoId: 'hash1:0',
        balance: {'.': '1000000', 'token1': '100'},
      }

      const result = amountsFromRemote(utxo, '.')

      expect(result).toEqual(utxo.balance)
    })
  })

  describe('buildSendTokenList', () => {
    it('should build token list with specific amounts', () => {
      const tokens: SendToken[] = [
        {
          amount: new BigNumber('100'),
          token: {identifier: 'token1', isDefault: false},
          shouldSendAll: false,
        },
        {
          amount: new BigNumber('200'),
          token: {identifier: 'token2', isDefault: false},
          shouldSendAll: false,
        },
      ]

      const result = buildSendTokenList('.', tokens, [])

      expect(result.token1).toBe('100')
      expect(result.token2).toBe('200')
    })

    it('should sum amounts when sending all from UTXOs', () => {
      const tokens: SendToken[] = [
        {
          amount: null as any,
          token: {identifier: 'token1', isDefault: false},
          shouldSendAll: true,
        },
      ]
      const utxos: Balance.Amounts[] = [
        {token1: '100'},
        {token1: '200'},
        {'.': '1000000'},
      ]

      const result = buildSendTokenList('.', tokens, utxos)

      expect(result.token1).toBe('300')
    })

    it('should handle tokens with no amount in UTXOs', () => {
      const tokens: SendToken[] = [
        {
          amount: null as any,
          token: {identifier: 'token1', isDefault: false},
          shouldSendAll: true,
        },
      ]
      const utxos: Balance.Amounts[] = [{'.': '1000000'}]

      const result = buildSendTokenList('.', tokens, utxos)

      expect(result.token1).toBe('0')
    })
  })

  describe('cardanoAssetToIdentifier', () => {
    it('should convert Cardano asset to identifier', () => {
      const policyIdBytes = Buffer.from('policy1hex', 'hex')
      const assetNameBytes = Buffer.from('asset1hex', 'hex')
      const mockPolicyId = {
        toBytes: jest.fn(() => policyIdBytes),
      }
      const mockAssetName = {
        name: jest.fn(() => assetNameBytes),
      }

      const result = cardanoAssetToIdentifier(
        mockPolicyId as any,
        mockAssetName as any,
      )

      expect(result).toContain(policyIdBytes.toString('hex'))
      expect(result).toContain(assetNameBytes.toString('hex'))
      expect(result).toContain('.')
    })
  })

  describe('identifierToCardanoAsset', () => {
    it('should convert identifier to Cardano asset', () => {
      const mockPolicyId = {}
      const mockAssetName = {}
      const mockCsl = {
        ScriptHash: {
          fromHex: jest.fn(() => mockPolicyId),
        },
        AssetName: {
          fromHex: jest.fn(() => mockAssetName),
        },
      }

      const result = identifierToCardanoAsset(mockCsl as any, 'policy1.asset1')

      expect(result.policyId).toBe(mockPolicyId)
      expect(result.name).toBe(mockAssetName)
      expect(mockCsl.ScriptHash.fromHex).toHaveBeenCalledWith('policy1')
      expect(mockCsl.AssetName.fromHex).toHaveBeenCalledWith('asset1')
    })
  })

  describe('parseTokenList', () => {
    it('should parse token list from MultiAsset', () => {
      const mockAmount1 = {toStr: () => '100'}
      const mockAmount2 = {toStr: () => '200'}
      const mockAssetName1 = {}
      const mockAssetName2 = {}
      const policyIdBytes = Buffer.from('policy1', 'hex')
      const mockPolicyId = {
        toBytes: jest.fn(() => policyIdBytes),
      }
      const assetNameBytes1 = Buffer.from('asset1', 'hex')
      const assetNameBytes2 = Buffer.from('asset2', 'hex')
      const mockAssetsForPolicy = {
        keys: jest.fn(() => ({
          len: () => 2,
          get: jest
            .fn()
            .mockReturnValueOnce(mockAssetName1)
            .mockReturnValueOnce(mockAssetName2),
        })),
        get: jest
          .fn()
          .mockReturnValueOnce(mockAmount1)
          .mockReturnValueOnce(mockAmount2),
      }
      const mockMultiAsset = {
        keys: jest.fn(() => ({
          len: () => 1,
          get: () => mockPolicyId,
        })),
        get: jest.fn(() => mockAssetsForPolicy),
      }

      // Add name() method to asset name mocks
      const mockAssetName1WithName = {
        ...mockAssetName1,
        name: jest.fn(() => assetNameBytes1),
      }
      const mockAssetName2WithName = {
        ...mockAssetName2,
        name: jest.fn(() => assetNameBytes2),
      }
      const mockAssetsForPolicyWithNames = {
        ...mockAssetsForPolicy,
        keys: jest.fn(() => ({
          len: () => 2,
          get: jest
            .fn()
            .mockReturnValueOnce(mockAssetName1WithName)
            .mockReturnValueOnce(mockAssetName2WithName),
        })),
      }
      const mockMultiAssetWithNames = {
        ...mockMultiAsset,
        get: jest.fn(() => mockAssetsForPolicyWithNames),
      }

      const result = parseTokenList({} as any, mockMultiAssetWithNames as any)

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]?.amount).toBe('100')
    })
  })

  describe('resolveCip67Tag', () => {
    it('should resolve CIP-67 tag from asset name hex', () => {
      // CIP-67 format: 000643b0 + hex name
      const assetNameHex = '000643b0' + Buffer.from('test').toString('hex')

      const result = resolveCip67Tag(assetNameHex)

      expect(result.tag).toBe('0006') // First 4 hex chars
      expect(result.hexName).toBe('43b0' + Buffer.from('test').toString('hex'))
    })

    it('should return null tag for short hex', () => {
      const result = resolveCip67Tag('ab')

      expect(result.tag).toBeNull()
      expect(result.hexName).toBe('ab')
    })

    it('should extract tag from any hex string >= 4 chars', () => {
      // Function extracts first 4 chars as tag regardless of validity
      const assetNameHex = 'abcd1234' + Buffer.from('test').toString('hex')

      const result = resolveCip67Tag(assetNameHex)

      expect(result.tag).toBe('abcd') // First 4 hex chars
      expect(result.hexName).toBe('1234' + Buffer.from('test').toString('hex'))
    })
  })

  describe('ASCII_ASSET_NAME_BLACKLIST', () => {
    it('should contain expected blacklisted names', () => {
      expect(ASCII_ASSET_NAME_BLACKLIST).toContain('ADA')
      expect(ASCII_ASSET_NAME_BLACKLIST).toContain('ADAF')
      expect(ASCII_ASSET_NAME_BLACKLIST.length).toBeGreaterThan(0)
    })
  })
})
