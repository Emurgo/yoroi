import {parseActionFromMetadata} from './metadata'

describe('parseActionFromMetadata', () => {
  it('should return null if metadata is not a record', () => {
    const metadata = 'not a record'
    expect(parseActionFromMetadata(metadata)).toBeNull()
  })

  it('should return abstain vote if abstain is present in metadata', () => {
    const metadata = {
      1: {
        actionId: 1,
      },
    }
    expect(parseActionFromMetadata(metadata)).toEqual({kind: 'abstain'})
  })

  it('should return no-confidence vote if no-confidence is present in metadata', () => {
    const metadata = {
      1: {
        actionId: 2,
      },
    }
    expect(parseActionFromMetadata(metadata)).toEqual({kind: 'no-confidence'})
  })

  it('should return delegate vote if delegate is present in metadata', () => {
    const metadata = {
      1: {
        actionId: 3,
        drepID: 'drepID',
      },
    }
    expect(parseActionFromMetadata(metadata)).toEqual({
      kind: 'delegate',
      drepID: 'drepID',
    })
  })
})
