import {useState, useEffect} from 'react'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = () => {
  const {showNotice} = useResolver()
  const [data, setData] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await showNotice.read()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [showNotice])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    showNotice: data,
  }
}
