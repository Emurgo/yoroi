import {Portfolio} from '@yoroi/types'

import {alpha, toEnd, Tokens, toStart} from './tokens'

describe('getId', () => {
  it('should return the token info id', () => {
    const token = {
      info: {
        id: 'token_id',
      },
    }

    const result = Tokens.getId(token as Portfolio.Token)

    expect(result).toBe('token_id')
  })
})

describe('sort', () => {
  it('sorts alphabetically', () => {
    const sortedItems = [...items].sort(alpha((name) => name.toLocaleLowerCase()))
    // prettier-ignore
    expect(sortedItems).toEqual([
      '', 
      'a', 
      'a', 
      'b', 
      'c'
    ])
  })

  it('moves items to the start', () => {
    const sortedItems = [...items].sort(toStart((name) => name === 'c'))
    // prettier-ignore
    expect(sortedItems).toEqual([
      'c', 
      'a', 
      '', 
      'b', 
      'a'
    ])
  })

  it('moves items to the end', () => {
    const sortedItems = [...items].sort(toEnd((name) => name === 'c'))
    // prettier-ignore
    expect(sortedItems).toEqual([
      'a', 
      '', 
      'b', 
      'a', 
      'c'
    ])
  })
})

// prettier-ignore
const items = [
  'a', 
  '', 
  'c', 
  'b', 
  'a'
]

describe('getInfo', () => {
  it('should return the info property of a token object', () => {
    const token = {
      info: {
        id: 'token_id',
        name: 'test',
      },
    } as Portfolio.Token

    const result = Tokens.getInfo(token)
    expect(result).toEqual({
      id: 'token_id',
      name: 'test',
    })
  })

  it('should undefined if no info is present must not happen', () => {
    const token = {} as Portfolio.Token
    const result = Tokens.getInfo(token)
    expect(result).toBeUndefined()
  })
})

describe('getInfos', () => {
  it('should return an array of info properties from a record of tokens', () => {
    const tokens = {
      token1: {
        info: {
          id: 'token.1',
          name: 'TokenName1',
          ticker: 'TKN1',
          kind: 'ft',
          fingerprint: 'fingerprint',
          group: 'g',
        },
      },
      token2: {
        info: {
          id: 'token.2',
          name: 'TokenName2',
          ticker: 'TKN2',
          kind: 'ft',
          fingerprint: 'fingerprint',
          group: 'g',
        },
      },
      token3: {info: {id: 'token.3', ticker: 'TKN3', kind: 'ft', fingerprint: 'fingerprint', group: 'g', name: ''}},
    } as Portfolio.TokenRecords

    const result = Tokens.getInfos(tokens)
    expect(result).toEqual([
      {
        id: 'token.1',
        name: 'TokenName1',
        ticker: 'TKN1',
        kind: 'ft',
        fingerprint: 'fingerprint',
        group: 'g',
      },
      {
        id: 'token.2',
        name: 'TokenName2',
        ticker: 'TKN2',
        kind: 'ft',
        fingerprint: 'fingerprint',
        group: 'g',
      },
      {id: 'token.3', ticker: 'TKN3', kind: 'ft', fingerprint: 'fingerprint', group: 'g', name: ''},
    ])
  })

  it('should return an empty array if the record is empty', () => {
    const tokens = {} as Portfolio.TokenRecords
    const result = Tokens.getInfos(tokens)
    expect(result).toEqual([])
  })
})
