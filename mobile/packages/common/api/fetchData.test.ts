import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {fetchData} from './fetchData'

const mock = new MockAdapter(axios)

describe('fetchData', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should make GET request successfully', async () => {
    mock.onGet('/test').reply(200, {data: 'test'})

    const result = await fetchData({url: '/test'})

    expect(result.tag).toBe('right')
    if (result.tag === 'right') {
      expect(result.value.status).toBe(200)
      expect(result.value.data).toEqual({data: 'test'})
    }
  })

  it('should make POST request with data', async () => {
    mock.onPost('/test').reply(200, {success: true})

    const result = await fetchData({
      url: '/test',
      method: 'post',
      data: {key: 'value'},
    })

    expect(result.tag).toBe('right')
  })

  it('should call onSuccess handler on success', async () => {
    mock.onGet('/test').reply(200, {data: 'test'})
    const onSuccess = jest.fn()

    await fetchData({url: '/test', onSuccess})

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('should call onError handler on error', async () => {
    mock.onGet('/test').reply(500, {error: 'Server error'})
    const onError = jest.fn()

    await fetchData({url: '/test', onError})

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('should return error response for 4xx status', async () => {
    mock.onGet('/test').reply(400, {error: 'Bad request'})

    const result = await fetchData({url: '/test'})

    expect(result.tag).toBe('left')
    if (result.tag === 'left') {
      expect(result.error.status).toBe(400)
    }
  })

  it('should return network error when no response', async () => {
    mock.onGet('/test').reply(() => Promise.reject({request: {}}))

    const result = await fetchData({url: '/test'})

    expect(result.tag).toBe('left')
    if (result.tag === 'left') {
      expect(result.error.status).toBe(-1)
      expect(result.error.message).toBe('Network (no response)')
    }
  })

  it('should return invalid state error for other errors', async () => {
    mock.onGet('/test').reply(() => Promise.reject(new Error('Test error')))

    const result = await fetchData({url: '/test'})

    expect(result.tag).toBe('left')
    if (result.tag === 'left') {
      expect(result.error.status).toBe(-2)
    }
  })

  it('should use custom headers when provided', async () => {
    mock.onGet('/test').reply((config) => {
      expect(config.headers?.['Custom-Header']).toBe('value')
      return [200, {data: 'test'}]
    })

    await fetchData({
      url: '/test',
      headers: {'Custom-Header': 'value'},
    })
  })
})
