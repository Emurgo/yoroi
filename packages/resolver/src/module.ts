import {handleResolveAddress} from './handle/handle'

export const resolveAddress = async (domain: string) => {
  const handleResult = await handleResolveAddress(domain)

  return {
    handle: handleResult,
    cns: {
      error: null,
      addresses: null,
    },
    unstoppable: {
      error: null,
      addresses: null,
    },
  }
}
