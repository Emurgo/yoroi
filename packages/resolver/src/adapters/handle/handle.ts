import axios from 'axios'

export const handleResolveAddress = async (handle: string) => {
  const result: {
    error: string | null
    address: string | null
  } = {
    error: null,
    address: null,
  }

  const config = {
    method: 'get',
    url: `https://api.handle.me/handles/${handle}`,
    headers: {
      Accept: 'application/json',
    },
  }

  try {
    const {
      data: {
        resolved_addresses: {ada},
      },
    } = await axios(config)

    result.address = ada
    return result
  } catch (error) {
    if (axios.isAxiosError(error)) {
      result.error = error.response?.data.message
      return result
    } else if (error instanceof Error) {
      result.error = error.message
      return result
    }

    result.error = 'Unknown Error'
    return result
  }
}
