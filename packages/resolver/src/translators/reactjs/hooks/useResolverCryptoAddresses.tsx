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
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await crypto.getCardanoAddresses({resolve, strategy}, {})
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [crypto, resolve, strategy])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    cryptoAddresses: data,
  }
}
