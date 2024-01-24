import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {fetchData} from './fetchData' // Update with the actual path

const mock = new MockAdapter(axios)

describe('fetchData', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should handle a GET request successfully (without method)', async () => {
    const mockData = {id: 1, name: 'Test User'}
    mock.onGet('https://example.com/data').reply(200, mockData)

    const response = await fetchData<{id: number; name: string}>({
      url: 'https://example.com/data',
    })

    if (response.tag === 'left') fail('Response should be right')
    expect(response.tag).toBe('right')
    expect(response.value.data).toEqual(mockData)
    expect(response.value.status).toBe(200)
  })

  it('should handle a GET request successfully (providing method)', async () => {
    const mockData = {id: 1, name: 'Test User'}
    mock.onGet('https://example.com/data').reply(200, mockData)

    const response = await fetchData<{id: number; name: string}>({
      url: 'https://example.com/data',
      method: 'get',
    })

    if (response.tag === 'left') fail('Response should be right')
    expect(response.tag).toBe('right')
    expect(response.value.data).toEqual(mockData)
    expect(response.value.status).toBe(200)
  })

  it('should handle a POST request successfully', async () => {
    const postData = {title: 'New Post'}
    const mockResponse = {id: 1, title: 'New Post'}

    // Simulate a successful POST request
    mock.onPost('https://example.com/posts', postData).reply(200, mockResponse)

    const response = await fetchData<
      {id: number; title: string},
      typeof postData
    >({
      url: 'https://example.com/posts',
      method: 'post',
      data: postData,
    })

    if (response.tag === 'left') fail('Response should be right')
    expect(response.tag).toBe('right')
    expect(response.value.data).toEqual(mockResponse)
    expect(response.value.status).toBe(200)
  })

  it('should handle an error response', async () => {
    mock.onGet('https://example.com/error').reply(500)

    const response = await fetchData<{id: number; name: string}>({
      url: 'https://example.com/error',
    })

    if (response.tag === 'right') fail('Response should be left')
    expect(response.tag).toBe('left')
    expect(response.error.status).toBe(500)
  })

  it('should handle a timeout', async () => {
    mock.onGet('https://example.com/network-error').reply(() => {
      return Promise.reject({
        request: {},
      })
    })

    const response = await fetchData<{id: number; name: string}>({
      url: 'https://example.com/network-error',
    })

    if (response.tag === 'right') fail('Response should be left')
    expect(response.tag).toBe('left')
    expect(response.error.status).toBe(-1)
  })

  it('should handle an unknown error', async () => {
    mock.onGet('https://example.com/unknown-error').reply(() => {
      throw new Error('Some error')
    })

    const response = await fetchData<{id: number; name: string}>({
      url: 'https://example.com/unknown-error',
    })

    if (response.tag === 'right') fail('Response should be left')
    expect(response.tag).toBe('left')
    expect(response.error.status).toBe(-2)
  })
})
