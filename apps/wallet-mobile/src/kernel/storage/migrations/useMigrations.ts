import {App} from '@yoroi/types'
import * as React from 'react'

import {logger} from '../../logger/logger'
import {to4_9_0} from './4_9_0'
import {to4_26_0} from './4_26_0'
import {ErrorMigrationVersion} from './errors'
import {storageVersionMaker} from './storageVersion'

export const useMigrations = (storage: App.Storage) => {
  const [done, setDone] = React.useState(false)
  React.useEffect(() => {
    const storageVersion = storageVersionMaker(storage)

    const runMigrations = async () => {
      const currentVersion = await storageVersion.read()

      if (currentVersion !== storageVersion.current) {
        if (currentVersion < 1) {
          await to4_9_0(storage)
          await storageVersion.save(1)
          logger.info('useMigrations: Storages migrated to version 1')
        }

        if (currentVersion < 2) {
          await to4_26_0(storage)
          await storageVersion.save(2)
          logger.info('useMigrations: Storages migrated to version 2')
        }
      } else {
        logger.info('useMigrations: No migrations needed')
      }

      const savedVersion = await storageVersion.read()
      if (savedVersion != storageVersion.current) throw new ErrorMigrationVersion()

      setDone(true)
    }
    runMigrations()
  }, [storage])

  return done
}
