// fetcher.test.ts

import {fetcher} from './fetcher' // adjust the import to your file structure
import {ApiError, NetworkError} from '../errors/errors' // adjust the import to your file structure
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

describe('fetcher', () => {
  afterEach(() => {
    mock.reset()
  })

  it('fetches successfully', async () => {
    mock.onGet('/success').reply(200, {data: 'some data'})
    const result = await fetcher({url: '/success', method: 'GET'})
    expect(result).toEqual({data: 'some data'})
  })

  it('throws ApiError on status other than 2xx', async () => {
    mock.onGet('/error').reply(400, {message: 'Bad request'})
    await expect(fetcher({url: '/error', method: 'GET'})).rejects.toThrow(
      ApiError,
    )
    await expect(
      fetcher({url: '/error', method: 'GET'}),
    ).rejects.toHaveProperty('message', 'Api error: Bad request Status: 400')
  })

  it('throws NetworkError when no response received', async () => {
    // Simulating a network error by throwing an Axios-like error object
    mock.onGet('/network-error').reply(() => {
      return Promise.reject({
        request: {},
      })
    })

    await expect(
      fetcher({url: '/network-error', method: 'GET'}),
    ).rejects.toThrow(NetworkError)
    await expect(
      fetcher({url: '/network-error', method: 'GET'}),
    ).rejects.toHaveProperty('message', 'No response received')
  })

  it('throws generic Error for other cases', async () => {
    mock.onGet('/unknown-error').reply(() => {
      throw new Error('Some unknown error')
    })
    await expect(
      fetcher({url: '/unknown-error', method: 'GET'}),
    ).rejects.toThrow(Error)
    await expect(
      fetcher({url: '/unknown-error', method: 'GET'}),
    ).rejects.toHaveProperty('message', 'An unknown error occurred')
  })
})
