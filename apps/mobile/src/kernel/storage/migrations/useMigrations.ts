import {isNumber} from '@yoroi/common'
import {App} from '@yoroi/types'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {to4_26_0} from './4_26_0'
import {to4_28_0} from './4_28_0'
import {to4_9_0} from './4_9_0'
import {ErrorMigrationVersion} from './errors'

import {initInstallationId} from '~/kernel/storage/storages'

const currentVersion = 3
const keyStorageVersion = 'storageVersion'

export const storageVersionMaker = (storage: App.Storage) => {
  return {
    save(storageVersion: number) {
      // should save the last version always after migration, can't be higher than currentVersion
      if (storageVersion > currentVersion) throw new ErrorMigrationVersion()
      return storage.setItem(keyStorageVersion, storageVersion)
    },
    async read() {
      return storage
        .getItem(keyStorageVersion)
        .then((version) => (isNumber(version) ? version : currentVersion))
    },
    async newInstallation() {
      return storage.setItem(keyStorageVersion, currentVersion)
    },
    async remove() {
      return storage.removeItem(keyStorageVersion)
    },
    key: keyStorageVersion,
    current: currentVersion,
  }
}

export const useMigrations = (storage: App.Storage) => {
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    const storageVersion = storageVersionMaker(storage)

    const runMigrations = async () => {
      const currentVersion = await storageVersion.read()
      logger.info('useMigrations: Current version', {currentVersion})

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

        if (currentVersion < 3) {
          await to4_28_0(storage)
          await storageVersion.save(3)
          logger.info('useMigrations: Storages migrated to version 3')
        }
      } else {
        logger.info('useMigrations: No migrations needed')
      }

      const savedVersion = await storageVersion.read()
      if (savedVersion != storageVersion.current)
        throw new ErrorMigrationVersion()

      initInstallationId()
      setDone(true)
    }

    runMigrations()
  }, [storage])

  return done
}
