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
    balance: '1',
    isPrimary: false,
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
    balance: '2',
    isPrimary: false,
  },
  'token.3': {
    info: {id: 'token.3', ticker: 'TKN3', kind: 'ft', fingerprint: 'fingerprint', group: 'g', name: ''},
    balance: '3',
    isPrimary: true,
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
})
