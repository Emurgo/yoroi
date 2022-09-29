import React from 'react'
import {useMutation} from 'react-query'

import AppNavigator from './AppNavigator'
import {AUTH_METHOD_KEY, AUTH_METHOD_PIN, ENCRYPTED_PIN_HASH_KEY} from './hooks'
import {Storage, useStorage} from './Storage'

export const AppMigrations = () => {
  const storage = useStorage()
  const {isSuccess, migrate} = useMigrateAuthIfPin(storage)

  React.useEffect(() => {
    migrate()
  }, [migrate])

  return isSuccess ? <AppNavigator /> : null
}

const useMigrateAuthIfPin = (storage: Storage) => {
  const mutation = useMutation({
    mutationFn: () =>
      storage
        .multiGet([AUTH_METHOD_KEY, ENCRYPTED_PIN_HASH_KEY])
        .then(([[, authMethod], [, pin]]) => {
          // authMethod is not set and there is PIN we can migrate
          if (authMethod == null && pin != null) {
            return storage.setItem(AUTH_METHOD_KEY, JSON.stringify(AUTH_METHOD_PIN))
          }
        })
        .catch((error) => {
          console.error(`Error while migrating PIN ${error}`)
        }),
    retry: false,
  })

  return {
    migrate: mutation.mutate,
    ...mutation,
  }
}

export default AppMigrations
