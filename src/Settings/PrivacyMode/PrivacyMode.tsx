import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {UseMutationOptions, useQuery} from 'react-query'

import {useMutationWithInvalidations} from '../../hooks'

const PrivacyModeContext = React.createContext<undefined | PrivacyModeContext>(undefined)
export const PrivacyModeProvider: React.FC = ({children}) => {
  const privacyMode = usePrivacyMode()
  const selectPrivacyMode = useSavePrivacyMode()

  return (
    <PrivacyModeContext.Provider
      value={{
        privacyMode,
        selectPrivacyMode,
      }}
    >
      {children}
    </PrivacyModeContext.Provider>
  )
}

export const usePrivacyModeContext = () => React.useContext(PrivacyModeContext) || missingProvider()

const missingProvider = () => {
  throw new Error('PrivacyModeProvider is missing')
}

export const usePrivacyMode = () => {
  const query = useQuery<PrivacyMode, Error>({
    queryKey: ['privacyMode'],
    queryFn: async () => {
      const storedPrivacyMode = await AsyncStorage.getItem('/appSettings/privacyMode')

      if (storedPrivacyMode) {
        const parsedPrivacyMode = JSON.parse(storedPrivacyMode)
        return parsedPrivacyMode
      }

      return defaultPrivacyMode
    },
    suspense: true,
  })

  if (!query.data) throw new Error('Invalid state')

  return query.data
}

const useSavePrivacyMode = ({...options}: UseMutationOptions<void, Error, PrivacyMode> = {}) => {
  const mutation = useMutationWithInvalidations({
    mutationFn: async (privacyMode) => AsyncStorage.setItem('/appSettings/privacyMode', JSON.stringify(privacyMode)),
    invalidateQueries: [['privacyMode']],
    ...options,
  })

  return mutation.mutate
}

type PrivacyMode = 'SHOWN' | 'HIDDEN'
const defaultPrivacyMode = 'SHOWN' as PrivacyMode
type SavePrivacyMode = ReturnType<typeof useSavePrivacyMode>
type PrivacyModeContext = {
  privacyMode: PrivacyMode
  selectPrivacyMode: SavePrivacyMode
}
