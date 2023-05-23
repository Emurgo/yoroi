import {isAssetSupplyEntry} from './assetSuply'

describe('isAssetSupplyEntry', () => {
  it('returns true if object has supplies key of type object', () => {
    expect(isAssetSupplyEntry({supplies: {}})).toEqual(true)
    expect(isAssetSupplyEntry({supplies: 1})).toEqual(false)
    expect(isAssetSupplyEntry({supplies: []})).toEqual(false)
    expect(isAssetSupplyEntry({supplies: null})).toEqual(false)
    expect(isAssetSupplyEntry({supplies: undefined})).toEqual(false)
    expect(isAssetSupplyEntry({supplies: true})).toEqual(false)
  })

  it('returns false if not given object with supplies key', () => {
    expect(isAssetSupplyEntry(null)).toEqual(false)
    expect(isAssetSupplyEntry(1)).toEqual(false)
    expect(isAssetSupplyEntry([])).toEqual(false)
    expect(isAssetSupplyEntry(true)).toEqual(false)
    expect(isAssetSupplyEntry('hello')).toEqual(false)
    expect(isAssetSupplyEntry(undefined)).toEqual(false)
    expect(isAssetSupplyEntry({})).toEqual(false)
  })

  it('requires supply value to be a number or null', () => {
    expect(isAssetSupplyEntry({supplies: {a: 1}})).toEqual(true)
    expect(isAssetSupplyEntry({supplies: {a: null}})).toEqual(true)
    expect(isAssetSupplyEntry({supplies: {a: '1'}})).toEqual(false)
    expect(isAssetSupplyEntry({supplies: {a: true}})).toEqual(false)
  })
})
