import BigNumber from 'bignumber.js'

import {StorageReviverType, storageParse} from './storage-parse'

describe('storageParse', () => {
  const mapping = {
    age: StorageReviverType.AsBigInt,
    balance: StorageReviverType.AsBigNumber,
  }

  it('should parse JSON string and convert properties', () => {
    const whatever = '{"name": "John", "age": "25", "balance": "100"}'

    const result = storageParse(whatever, mapping)

    expect(result).toEqual({
      name: 'John',
      age: BigInt(25),
      balance: new BigNumber('100'),
    })
  })

  it('should return null if jsonString is null', () => {
    const nullable = null
    const empty = undefined

    const nullResult = storageParse(nullable, mapping)
    const emptyResult = storageParse(empty, mapping)

    expect(nullResult).toBeNull()
    expect(emptyResult).toBeNull()
  })
})
