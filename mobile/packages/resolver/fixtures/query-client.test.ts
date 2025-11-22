import {QueryClient} from '@tanstack/react-query'

import {queryClientFixture} from './query-client'

describe('queryClientFixture', () => {
  it('should create a QueryClient with correct default options', () => {
    const client = queryClientFixture()
    expect(client).toBeInstanceOf(QueryClient)
  })

  it('should create a new instance each time', () => {
    const client1 = queryClientFixture()
    const client2 = queryClientFixture()
    expect(client1).not.toBe(client2)
  })

  it('should have retry disabled for queries', () => {
    const client = queryClientFixture()
    const options = client.getDefaultOptions()
    expect(options.queries?.retry).toBe(false)
  })

  it('should have retry disabled for mutations', () => {
    const client = queryClientFixture()
    const options = client.getDefaultOptions()
    expect(options.mutations?.retry).toBe(false)
  })

  it('should have gcTime set to 0 for queries', () => {
    const client = queryClientFixture()
    const options = client.getDefaultOptions()
    expect(options.queries?.gcTime).toBe(0)
  })

  it('should have gcTime set to 0 for mutations', () => {
    const client = queryClientFixture()
    const options = client.getDefaultOptions()
    expect(options.mutations?.gcTime).toBe(0)
  })
})

