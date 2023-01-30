import {LegacyToken, TokenInfo} from '../../types'
import {YoroiWallet} from '../types'
import {TokenRegistryEntry} from './api'
import {
  asciiToHex,
  fallbackTokenInfo,
  hexToAscii,
  toAssetName,
  tokenInfo,
  toPolicyId,
  toToken,
  toTokenFingerprint,
  toTokenId,
  toTokenInfo,
  toTokenSubject,
} from './utils'

describe('api utils', () => {
  it('toPolicyId, toAssetName', () => {
    const policyId = '1'.repeat(56)
    const assetName = 'assetName'
    const assetNameHex = asciiToHex('assetName')

    const tokenIndentifier = policyId + '.' + assetNameHex
    expect(toPolicyId(tokenIndentifier)).toEqual(policyId)
    expect(toAssetName(tokenIndentifier)).toEqual(assetName)

    const tokenSubject = policyId + assetNameHex
    expect(toPolicyId(tokenSubject)).toEqual(policyId)

    const noName = policyId
    expect(toPolicyId(noName)).toEqual(policyId)
    expect(toAssetName(noName)).toEqual(undefined)
  })

  describe('toTokenSubject', () => {
    it('with asset name', () => {
      const policyId = '1'.repeat(56)
      const assetName = 'assetName'
      const assetNameHex = asciiToHex(assetName)

      const tokenIdentifier = policyId + '.' + assetNameHex
      const tokenSubject = toTokenSubject(tokenIdentifier)
      expect(toTokenSubject(tokenIdentifier)).toBe(
        '1111111111111111111111111111111111111111111111111111111161737365744e616d65',
      )
      expect(toTokenSubject(tokenSubject)).toEqual(tokenSubject)
    })

    it('without asset name', () => {
      const policyId = '1'.repeat(56)

      const tokenIdentifier = policyId + '.'
      const tokenSubject = toTokenSubject(tokenIdentifier)
      expect(tokenSubject).toEqual(policyId)
      expect(toTokenSubject(tokenSubject)).toEqual(tokenSubject)
    })
  })

  describe('toTokenId', () => {
    it('with asset name', () => {
      const policyId = '1'.repeat(56)
      const assetName = 'assetName'
      const assetNameHex = asciiToHex(assetName)

      const tokenIdentifier = policyId + '.' + assetNameHex
      expect(toTokenId(tokenIdentifier)).toBe(
        '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
      )

      const tokenSubject = policyId + assetNameHex
      expect(toTokenId(tokenSubject)).toBe(
        '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
      )
    })

    it('without asset name', () => {
      const policyId = '1'.repeat(56)

      const tokenIdentifier = policyId + '.'
      expect(toTokenId(tokenIdentifier)).toBe('11111111111111111111111111111111111111111111111111111111.')

      const tokenSubject = policyId
      expect(toTokenId(tokenSubject)).toBe('11111111111111111111111111111111111111111111111111111111.')
    })
  })

  it('hexToAscii/asciiToHex', () => {
    const hex = '61737365744e616d65'
    const ascii = 'assetName'
    expect(hexToAscii(hex)).toBe(ascii)
    expect(asciiToHex(ascii)).toBe(hex)
  })

  it('toTokenFingerprint', () => {
    const policyId = '1'.repeat(56)
    const assetName = 'assetName'
    const assetNameHex = asciiToHex(assetName)

    expect(
      toTokenFingerprint({
        policyId,
        assetNameHex,
      }),
    ).toBe('asset1rafllrcpcurgdkesxy9vsvh40cgz2vrndle80x')

    expect(
      toTokenFingerprint({
        policyId,
        assetNameHex: undefined,
      }),
    ).toBe('asset17jfppv3h7hnsjfqq5lyp52dyhwstfv9e4uauga')
  })

  describe('tokenInfo', () => {
    it('tokenInfo', () => {
      const entry: TokenRegistryEntry = {
        subject: '1111111111111111111111111111111111111111111111111111111161737365744e616d65',
        name: {
          value: 'assetName',
          signatures: [],
          sequenceNumber: 1,
        },
        description: {
          value: 'description',
          signatures: [],
          sequenceNumber: 1,
        },
        decimals: {
          value: 6,
          signatures: [],
          sequenceNumber: 0,
        },
        logo: {
          value: 'logo',
          signatures: [],
          sequenceNumber: 0,
        },
        ticker: {
          value: 'ticker',
          signatures: [],
          sequenceNumber: 0,
        },
        url: {
          value: 'url',
          signatures: [],
          sequenceNumber: 0,
        },
      }

      expect(tokenInfo(entry)).toEqual({
        id: '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
        name: 'assetName',
        group: '11111111111111111111111111111111111111111111111111111111',
        decimals: 6,
        description: 'description',
        fingerprint: 'asset1rafllrcpcurgdkesxy9vsvh40cgz2vrndle80x',
        logo: 'logo',
        ticker: 'ticker',
        url: 'url',
      })
    })

    it('tokenInfo with optionals/defaults', () => {
      const entry: TokenRegistryEntry = {
        subject: '1111111111111111111111111111111111111111111111111111111161737365744e616d65',
        name: {
          value: 'assetName',
          signatures: [],
          sequenceNumber: 1,
        },
        description: {
          value: 'description',
          signatures: [],
          sequenceNumber: 1,
        },
      }

      expect(tokenInfo(entry)).toEqual({
        id: '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
        name: 'assetName',
        group: '11111111111111111111111111111111111111111111111111111111',
        decimals: 0,
        description: 'description',
        fingerprint: 'asset1rafllrcpcurgdkesxy9vsvh40cgz2vrndle80x',
        logo: undefined,
        ticker: undefined,
        url: undefined,
      })
    })

    it('fallback', () => {
      expect(fallbackTokenInfo('11111111111111111111111111111111111111111111111111111111')).toEqual({
        id: '11111111111111111111111111111111111111111111111111111111.',
        group: '11111111111111111111111111111111111111111111111111111111',
        decimals: 0,
        fingerprint: 'asset17jfppv3h7hnsjfqq5lyp52dyhwstfv9e4uauga',

        name: undefined,
        description: undefined,
        logo: undefined,
        ticker: undefined,
        url: undefined,
      })

      expect(fallbackTokenInfo('1111111111111111111111111111111111111111111111111111111161737365744e616d65')).toEqual({
        id: '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
        group: '11111111111111111111111111111111111111111111111111111111',
        decimals: 0,
        fingerprint: 'asset1rafllrcpcurgdkesxy9vsvh40cgz2vrndle80x',

        name: 'assetName',
        description: undefined,
        logo: undefined,
        ticker: undefined,
        url: undefined,
      })
    })
  })

  it('toToken/toTokenInfo', () => {
    const wallet = {
      networkId: 300,
      primaryTokenInfo: {id: ''},
    } as YoroiWallet

    const tokenInfo: TokenInfo = {
      id: '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
      group: '11111111111111111111111111111111111111111111111111111111',
      decimals: 0,
      fingerprint: 'asset1rafllrcpcurgdkesxy9vsvh40cgz2vrndle80x',

      name: 'assetName',
      description: 'description',
      logo: undefined,
      ticker: undefined,
      url: undefined,
    }

    const token: LegacyToken = {
      identifier: '11111111111111111111111111111111111111111111111111111111.61737365744e616d65',
      isDefault: false,
      networkId: 300,
      metadata: {
        type: 'Cardano',
        policyId: '11111111111111111111111111111111111111111111111111111111',
        assetName: '61737365744e616d65',
        numberOfDecimals: 0,
        longName: 'description',
        maxSupply: null,
        ticker: null,
      },
    }

    expect(toToken({wallet, tokenInfo})).toEqual(token)
    expect(toTokenInfo(token)).toEqual(tokenInfo)
  })
})
