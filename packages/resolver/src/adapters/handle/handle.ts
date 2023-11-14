import {fetcher} from '@yoroi/common'

export const getHandleAddresses = async (receiver: string) => {
  const result: {
    error: string | null
    address: string | null
  } = {
    error: null,
    address: null,
  }

  const config = {
    method: 'get',
    url: `https://api.handle.me/handles/${receiver}`,
    headers: {Accept: 'application/json'},
  }

  try {
    const response = await fetcher(config)

    if (response?.data?.resolved_addresses?.ada) {
      result.address = response.data.resolved_addresses.ada
      return result
    }

    throw new Error('Handle Resolver error: invalid response')
  } catch (error: any) {
    if (error instanceof Error) {
      result.error = error.message
      return result
    }

    result.error = 'Handle Resolver error: unknown Error'
    return result
  }
}
