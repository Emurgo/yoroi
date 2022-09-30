import React from 'react'

import AppNavigator from './AppNavigator'
import {useMigrateAuthMethod} from './auth'
import {useStorage} from './Storage'

export const AppMigrations = () => {
  const storage = useStorage()
  const {isSuccess, migrate} = useMigrateAuthMethod(storage)

  React.useEffect(() => {
    migrate()
  }, [migrate])

  return isSuccess ? <AppNavigator /> : null
}

export default AppMigrations
