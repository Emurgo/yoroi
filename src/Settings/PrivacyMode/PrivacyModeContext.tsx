import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import {useMutation, UseMutationOptions, useQuery, useQueryClient} from 'react-query'

import {PrivacyModeStatus} from '../../types'

const PrivacyModeContext = React.createContext<undefined | PrivacyModeContext>(undefined)
export const PrivacyModeProvider: React.FC = ({children}) => {
  const privaceModeStatus = usePrivacyMode()
  const selectPrivacyModeStatus = useSavePrivacyMode()

  return (
    <PrivacyModeContext.Provider
      value={{
        privaceModeStatus,
        selectPrivacyModeStatus,
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
  const query = useQuery<PrivacyModeStatus, Error>({
    initialData: defaultPrivacyModeStatus,
    queryKey: ['privacyModeStatus'],
    queryFn: async () => {
      const storedPrivaceModeStatus = await AsyncStorage.getItem('/appSettings/privacyModeStatus')

      if (storedPrivaceModeStatus) {
        const parsedPrivaceModeStatus = JSON.parse(storedPrivaceModeStatus)
        return parsedPrivaceModeStatus
      }

      return defaultPrivacyModeStatus
    },
    suspense: true,
  })

  if (!query.data) throw new Error('Invalid state')

  return query.data
}

const useSavePrivacyMode = ({onSuccess, ...options}: UseMutationOptions<void, Error, PrivacyModeStatus> = {}) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (privacyModeStatus) =>
      AsyncStorage.setItem('/appSettings/privacyModeStatus', JSON.stringify(privacyModeStatus)),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries('privacyModeStatus')
      onSuccess?.(data, variables, context)
    },
    ...options,
  })

  return mutation.mutate
}

const defaultPrivacyModeStatus = 'SHOWN' as PrivacyModeStatus
type SavePrivacyModeStatus = ReturnType<typeof useSavePrivacyMode>
type PrivacyModeContext = {
  privaceModeStatus: PrivacyModeStatus
  selectPrivacyModeStatus: SavePrivacyModeStatus
}
