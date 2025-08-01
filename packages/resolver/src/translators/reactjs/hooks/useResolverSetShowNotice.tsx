import {useState} from 'react'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverSetShowNotice = () => {
  const {showNotice} = useResolver()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const setShowNotice = async (value: boolean) => {
    try {
      setIsLoading(true)
      setError(null)
      await showNotice.save(value)
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    isError: error !== null,
    setShowNotice,
  }
}
