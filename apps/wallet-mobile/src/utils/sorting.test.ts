import {alpha, toEnd, toStart} from './sorting'

describe('sorting', () => {
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
