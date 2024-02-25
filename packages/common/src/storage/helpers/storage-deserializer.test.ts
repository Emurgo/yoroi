import BigNumber from 'bignumber.js'

import {StorageReviverType, storageDeserializer} from './storage-deserializer'

describe('storageDeserializer', () => {
  const mapping = {
    age: StorageReviverType.AsBigInt,
    balance: StorageReviverType.AsBigNumber,
  }
  const deserializer = storageDeserializer(mapping)

  it('should parse JSON string and convert properties', () => {
    const whatever = JSON.stringify({
      name: 'John',
      age: '25',
      balance: '100',
      nested: {
        balance: '111',
        age: '10',
        data: [{age: '1'}],
      },
    })

    const result = deserializer(whatever)

    expect(result).toEqual({
      name: 'John',
      age: 25n,
      balance: new BigNumber('100'),
      nested: {
        balance: new BigNumber('111'),
        age: 10n,
        data: [{age: 1n}],
      },
    })
  })

  it('should return null if jsonString is null', () => {
    const nullable = JSON.stringify(null)
    const empty = undefined
    const invalid = '{x:'

    const nullResult = storageDeserializer(mapping)(nullable)
    const emptyResult = storageDeserializer(mapping)(empty as any)
    const invalidResult = storageDeserializer(mapping)(invalid as any)

    expect(nullResult).toBeNull()
    expect(emptyResult).toBeNull()
    expect(invalidResult).toBeNull()
  })
})
