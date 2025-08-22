import {queryClientFixture} from './query-client'

describe('queryClientFixture', () => {
  it('should return a QueryClient with the correct default options', () => {
    const queryClient = queryClientFixture()
    const defaultOptions = queryClient.getDefaultOptions()

    expect(defaultOptions.queries).toEqual(
      expect.objectContaining({
        retry: false,
        gcTime: 0,
      }),
    )

    expect(defaultOptions.mutations).toEqual(
      expect.objectContaining({
        retry: false,
        gcTime: 0,
      }),
    )
  })
})
