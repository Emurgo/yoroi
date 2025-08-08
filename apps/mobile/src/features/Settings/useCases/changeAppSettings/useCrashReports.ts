import AsyncStorage, {
  AsyncStorageStatic,
} from '@react-native-async-storage/async-storage'
import {useQuery} from '@tanstack/react-query'
import {parseBoolean, useMutationWithInvalidations} from '@yoroi/common'
import * as React from 'react'

import {isDev, isNightly} from '~/kernel/constants'
import {logger} from '~/kernel/logger/logger'

const crashReportsStorageKey = 'sendCrashReports'

export const getCrashReportsEnabled = async (
  storage: AsyncStorageStatic = AsyncStorage,
) => {
  const data = await storage.getItem(crashReportsStorageKey)
  return parseBoolean(data) ?? false
}

const useCrashReportsEnabled = (storage: AsyncStorageStatic = AsyncStorage) => {
  const query = useQuery({
    queryKey: [crashReportsStorageKey],
    queryFn: () => getCrashReportsEnabled(storage),
    enabled: !isNightly && !isDev,
  })

  if (isNightly || isDev) return true
  return query.data ?? true
}

const useSetCrashReportsEnabled = (
  storage: AsyncStorageStatic = AsyncStorage,
) => {
  const mutation = useMutationWithInvalidations<void, Error, boolean>({
    mutationFn: async (enabled) => {
      if (enabled) {
        logger.enable()
      } else {
        logger.disable()
      }
      return storage.setItem(crashReportsStorageKey, JSON.stringify(enabled))
    },
    invalidateQueries: [[crashReportsStorageKey]],
  })

  return mutation.mutate
}

export const useCrashReports = () => {
  const set = useSetCrashReportsEnabled()

  return {
    enabled: useCrashReportsEnabled(),
    enable: React.useCallback(() => set(true), [set]),
    disable: React.useCallback(() => set(false), [set]),
  }
}
