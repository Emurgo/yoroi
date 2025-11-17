import {isNumber} from '@yoroi/common'
import {App} from '@yoroi/types'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {storageCurrentVersion} from '~/kernel/storage/storages'

import {ErrorMigrationVersion} from './errors'
import {runMigrations, validateMigrationRegistry} from './runner'

const keyStorageVersion = 'storageVersion'

/**
 * Storage version manager
 * Exported for use in runner and other modules
 */
export const storageVersionMaker = (storage: App.Storage) => {
  return {
    save(storageVersion: number) {
      // should save the last version always after migration, can't be higher than currentVersion
      if (storageVersion > storageCurrentVersion)
        throw new ErrorMigrationVersion()
      return storage.setItem(keyStorageVersion, storageVersion)
    },
    async read() {
      return storage
        .getItem(keyStorageVersion)
        .then((version) =>
          isNumber(version) ? version : storageCurrentVersion,
        )
    },
    async newInstallation() {
      return storage.setItem(keyStorageVersion, storageCurrentVersion)
    },
    async remove() {
      return storage.removeItem(keyStorageVersion)
    },
    key: keyStorageVersion,
    current: storageCurrentVersion,
  }
}

/**
 * React hook wrapper for migrations
 * Uses the new functional migration runner internally
 * Maintains backward compatibility with existing code
 */
export const useMigrations = (storage: App.Storage) => {
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    // Validate migration registry on first run
    if (!validateMigrationRegistry()) {
      logger.error('useMigrations: Migration registry validation failed')
      // Continue anyway - migrations will fail gracefully
    }

    const executeMigrations = async () => {
      try {
        const results = await runMigrations(storage)
        const failed = results.filter((r) => !r.success)

        if (failed.length > 0) {
          logger.error('useMigrations: Some migrations failed', {
            failed: failed.map((f) => ({
              version: f.version,
              name: f.name,
              error: f.error.message,
            })),
          })
          // Don't set done if migrations failed
          return
        }

        setDone(true)
      } catch (error) {
        logger.error('useMigrations: Migration execution failed', {error})
        // Don't set done on error
      }
    }

    executeMigrations()
  }, [storage])

  return done
}
