import {useState, useEffect} from 'react'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = () => {
  const {showNotice} = useResolver()
  const [data, setData] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isCancelled = false
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await showNotice.read()
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
  }, [showNotice])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    showNotice: data,
  }
}
