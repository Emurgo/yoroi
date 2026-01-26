import {isNumber} from '@yoroi/common'
import {App} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'
import {
  attemptStorageRecovery,
  initInstallationId,
  storageCurrentVersion,
  validateStorageIntegrity,
} from '~/kernel/storage/storages'

import {ErrorMigrationVersion} from './errors'
import {
  getMigrationsToRun,
  getSortedMigrations,
  validateMigrationDependencies,
} from './registry'
import type {MigrationResult} from './types'

const keyStorageVersion = 'storageVersion'

/**
 * Storage version manager
 */
const storageVersionMaker = (storage: App.Storage) => {
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
 * Run all pending migrations
 * CRITICAL: Maintains 100% backward compatibility with existing system
 */
export const runMigrations = async (
  storage: App.Storage,
): Promise<MigrationResult[]> => {
  // Validate storage integrity before running any migrations
  const integrityResult = await validateStorageIntegrity()
  if (!integrityResult.isHealthy) {
    logger.warn(
      'runMigrations: Storage integrity check failed, attempting recovery',
      {
        errors: integrityResult.errors,
      },
    )

    const recovered = await attemptStorageRecovery()
    if (!recovered) {
      logger.error(
        'runMigrations: Storage recovery failed, proceeding with caution',
      )
      // Continue anyway - migrations might still work, and we'll catch errors individually
    }
  }

  const storageVersion = storageVersionMaker(storage)
  const currentVersion = await storageVersion.read()
  const targetVersion = storageCurrentVersion

  logger.debug('runMigrations: Starting', {
    currentVersion,
    targetVersion,
    storageHealthy: integrityResult.isHealthy,
  })

  // If already at target version, no migrations needed
  if (currentVersion === targetVersion) {
    logger.debug('runMigrations: No migrations needed')
    initInstallationId()
    return []
  }

  // Get migrations that need to run
  const migrationsToRun = getMigrationsToRun(currentVersion, targetVersion)

  if (migrationsToRun.length === 0) {
    logger.info('runMigrations: No migrations to run')
    initInstallationId()
    return []
  }

  const results: MigrationResult[] = []
  const completedVersions: number[] = []

  // Run migrations sequentially to maintain order and allow rollback
  for (const migration of migrationsToRun) {
    logger.info('runMigrations: Running migration', {
      version: migration.version,
      name: migration.name,
      description: migration.description,
    })

    // Validate dependencies
    if (!validateMigrationDependencies(migration, completedVersions)) {
      const error = new Error(
        `Migration ${migration.name} (v${migration.version}) has unmet dependencies`,
      )
      logger.error('runMigrations: Dependency validation failed', {
        migration: migration.name,
        version: migration.version,
        error,
      })
      results.push({
        success: false,
        version: migration.version,
        name: migration.name,
        error,
      })
      break
    }

    // Optional: Validate if migration is needed
    if (migration.validate) {
      const needsMigration = await migration.validate(storage)
      if (!needsMigration) {
        logger.info('runMigrations: Migration not needed (skipped)', {
          version: migration.version,
          name: migration.name,
        })
        completedVersions.push(migration.version)
        await storageVersion.save(migration.version)
        results.push({
          success: true,
          version: migration.version,
          name: migration.name,
        })
        continue
      }
    }

    try {
      // Run migration
      await migration.migrate(storage)

      // Save version after successful migration
      await storageVersion.save(migration.version)
      completedVersions.push(migration.version)

      logger.info('runMigrations: Migration completed', {
        version: migration.version,
        name: migration.name,
      })

      results.push({
        success: true,
        version: migration.version,
        name: migration.name,
      })
    } catch (error) {
      logger.error('runMigrations: Migration failed', {
        version: migration.version,
        name: migration.name,
        error,
      })

      // Attempt rollback if available
      if (migration.rollback) {
        try {
          logger.info('runMigrations: Attempting rollback', {
            version: migration.version,
            name: migration.name,
          })
          await migration.rollback(storage)
          logger.info('runMigrations: Rollback successful', {
            version: migration.version,
            name: migration.name,
          })
        } catch (rollbackError) {
          logger.error('runMigrations: Rollback failed', {
            version: migration.version,
            name: migration.name,
            error: rollbackError,
          })
        }
      }

      results.push({
        success: false,
        version: migration.version,
        name: migration.name,
        error: error instanceof Error ? error : new Error(String(error)),
      })

      // Stop on first failure
      break
    }
  }

  // Verify final version - don't throw, let caller handle via results
  const finalVersion = await storageVersion.read()
  if (finalVersion !== targetVersion) {
    logger.error('runMigrations: Version mismatch after migrations', {
      expected: targetVersion,
      actual: finalVersion,
    })
    // Return results with failures instead of throwing
    // Caller can inspect results and decide how to handle
    return results
  }

  // Initialize installation ID after successful migrations
  initInstallationId()

  logger.info('runMigrations: Completed', {
    results: results.map((r) => ({
      version: r.version,
      name: r.name,
      success: r.success,
    })),
  })

  return results
}

/**
 * Validate that all migrations are properly ordered
 */
export const validateMigrationRegistry = (): boolean => {
  const sorted = getSortedMigrations()
  const versions = sorted.map((m) => m.version)

  // Check for duplicates
  const duplicates = versions.filter((v, i) => versions.indexOf(v) !== i)
  if (duplicates.length > 0) {
    logger.error('validateMigrationRegistry: Duplicate versions found', {
      duplicates,
    })
    return false
  }

  // Check for gaps (optional - migrations don't need to be consecutive)
  // But we should at least start from 1
  if (versions[0] !== 1) {
    logger.error(
      'validateMigrationRegistry: Migrations must start from version 1',
      {
        firstVersion: versions[0],
      },
    )
    return false
  }

  return true
}
