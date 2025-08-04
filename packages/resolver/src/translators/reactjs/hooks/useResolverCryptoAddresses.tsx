import {useState, useEffect} from 'react'
import {Resolver} from '@yoroi/types'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverCryptoAddresses = ({
  resolve,
  strategy = 'all',
}: {
  resolve: Resolver.Receiver['resolve']
  strategy?: Resolver.Strategy
}) => {
  const {crypto} = useResolver()
  const [data, setData] = useState<Resolver.AddressesResponse>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await crypto.getCardanoAddresses({resolve, strategy}, {})
        if (!isCancelled) {
          setData(result)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error)
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isCancelled = true
    }
  }, [crypto, resolve, strategy])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    cryptoAddresses: data,
  }
}
