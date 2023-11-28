import {asYoroiParams} from './asYoroiParams'

describe('asYoroiParams function', () => {
  it('picks specified properties from an object', () => {
    const object = {a: 1, b: 2, c: 3}
    const keys: (keyof typeof object)[] = ['a', 'c']
    const expectedResult = {a: 1, c: 3}
    expect(asYoroiParams(object, keys)).toEqual(expectedResult)
  })
  it('ignores keys that are not present in the object', () => {
    const object: {[key: string]: number} = {a: 1, b: 2}
    const keys: string[] = ['a', 'c']
    const expectedResult = {a: 1}
    expect(asYoroiParams(object, keys)).toEqual(expectedResult)
  })
})
