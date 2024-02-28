import {App} from '@yoroi/types'
import * as React from 'react'

import {to4_9_0} from './4_9_0'
import {to4_26_0} from './4_26_0'
import {storageVersionMaker} from './storageVersion'

export const useMigrations = (storage: App.Storage) => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const storageVersion = storageVersionMaker(storage)

    const runMigrations = async () => {
      const currentVersion = await storageVersion.read()

      if (currentVersion < 1) {
        await to4_9_0(storage)
        await storageVersion.save(1)
      }

      if (currentVersion < 2) {
        await to4_26_0(storage)
        await storageVersion.save(2)
      }

      // ATTENTION: when creating a new migration
      // remember setting the storageVersion.lastStorageVersion equals your last migration
      setDone(true)
    }
    runMigrations()
  }, [storage])

  return done
}
