import {catalystApiMaker} from './api-maker'

describe('catalystApiMaker', () => {
  it('should create an instance of the Catalyst API', () => {
    const api = catalystApiMaker({request: jest.fn()})

    expect(api.getFundInfo).toBeDefined()

    // coverage only
    const catalyst = catalystApiMaker()
    expect(catalyst.getFundInfo).toBeDefined()
  })
})
