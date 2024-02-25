import BigNumber from 'bignumber.js'

import {StorageReviverType, storageParse} from './storage-parse'

describe('storageParse', () => {
  const mapping = {
    age: StorageReviverType.AsBigInt,
    balance: StorageReviverType.AsBigNumber,
  }
  const jsonParse = storageParse(mapping)

  it('should parse JSON string and convert properties', () => {
    const whatever = '{"name": "John", "age": "25", "balance": "100"}'

    const result = jsonParse(whatever)

    expect(result).toEqual({
      name: 'John',
      age: BigInt(25),
      balance: new BigNumber('100'),
    })
  })

  it('should return null if jsonString is null', () => {
    const nullable = null
    const empty = undefined

    const nullResult = storageParse(mapping)(nullable)
    const emptyResult = storageParse(mapping)(empty)

    expect(nullResult).toBeNull()
    expect(emptyResult).toBeNull()
  })
})
