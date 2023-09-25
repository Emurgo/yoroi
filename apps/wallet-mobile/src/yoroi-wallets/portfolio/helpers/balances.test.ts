import {Portfolio} from '@yoroi/types'

import {Balances} from './balances'

const balances: Portfolio.TokenBalanceRecords<Portfolio.Token> = {
  'token.1': {
    info: {
      id: 'token.1',
      name: '',
      ticker: '',
      kind: 'ft',
      fingerprint: 'fingerprint',
      group: 'g',
    },
    balance: {
      quantity: '1',
      isPrimary: false,
      resolvedDecimals: 0,
      resolvedName: 'token',
    },
  },
  'token.2': {
    info: {
      id: 'token.2',
      name: 'TokenName2',
      ticker: 'TKN2',
      kind: 'nft',
      fingerprint: 'fingerprint',
      group: 'g',
    },
    balance: {
      quantity: '2',
      isPrimary: false,
      resolvedDecimals: 0,
      resolvedName: 'TKN2',
    },
  },
  'token.3': {
    info: {id: 'token.3', ticker: 'TKN3', kind: 'ft', fingerprint: 'fingerprint', group: 'g', name: ''},
    balance: {quantity: '3', isPrimary: true, resolvedDecimals: 0, resolvedName: 'TKN3'},
  },
}

describe('Balances', () => {
  describe('sortByName', () => {
    it('should order the balances by name', () => {
      expect(Balances.sortByName(balances)).toEqual([
        [balances['token.3'].info.id, balances['token.3']],
        [balances['token.2'].info.id, balances['token.2']],
        [balances['token.1'].info.id, balances['token.1']],
      ])
    })
  })

  describe('filterByNfts', () => {
    it('should return only nfts', () => {
      expect(Balances.filterByNfts(Balances.sortByName(balances))).toEqual([
        [balances['token.2'].info.id, balances['token.2']],
      ])
    })
  })

  describe('filterByFts', () => {
    it('should return only fts', () => {
      expect(Balances.filterByFts(Balances.sortByName(balances))).toEqual([
        [balances['token.3'].info.id, balances['token.3']],
        [balances['token.1'].info.id, balances['token.1']],
      ])
    })
  })

  describe('filterByName', () => {
    it('should return only balances that has the name', () => {
      expect(Balances.filterByName(Balances.sortByName(balances), 'name2')).toEqual([
        [balances['token.2'].info.id, balances['token.2']],
      ])
    })
  })

  describe('findById', () => {
    it('should return the id or undefined', () => {
      expect(Balances.findById(Balances.sortByName(balances), 'token.2')).toEqual([
        balances['token.2'].info.id,
        balances['token.2'],
      ])
      expect(Balances.findById(Balances.sortByName(balances), 'missing')).toBeUndefined()
    })
  })

  describe('toAmounts', () => {
    it('should ', () => {
      expect(Balances.toAmounts(Balances.sortByName(balances))).toEqual({
        'token.1': '1',
        'token.2': '2',
        'token.3': '3',
      })
    })
  })
})
