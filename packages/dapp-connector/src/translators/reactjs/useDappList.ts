import {useState, useEffect} from 'react'

import {DappListResponse} from '../../adapters/api'
import {useDappConnector} from './DappConnectorProvider'

export const useDappList = () => {
  const {manager} = useDappConnector()
  const [data, setData] = useState<DappListResponse | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await manager.getDAppList()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [manager])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
  }
}
