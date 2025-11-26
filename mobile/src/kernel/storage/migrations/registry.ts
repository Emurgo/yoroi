import {logger} from '~/kernel/logger/logger'

import {to4_9_0} from './4_9_0'
import {to4_26_0} from './4_26_0'
import {to4_28_0} from './4_28_0'
import {to6_0_0} from './6_0_0'
import type {Migration} from './types'

/**
 * Migration registry
 * All migrations must be registered here in order
 * CRITICAL: Maintain backward compatibility - do not modify existing migrations
 */
export const migrations: Migration[] = [
  {
    version: 1,
    name: '4.9.0',
    migrate: to4_9_0,
    description: 'Migrate auth settings from legacy format',
  },
  {
    version: 2,
    name: '4.26.0',
    migrate: to4_26_0,
    description: 'Add addressMode field to wallet metadata',
    dependencies: [1],
  },
  {
    version: 3,
    name: '4.28.0',
    migrate: to4_28_0,
    description: 'Migrate wallet metadata to version 3 format',
    dependencies: [2],
  },
  {
    version: 4,
    name: '6.0.0',
    migrate: to6_0_0,
    description: 'Migrate installationId to new storage location',
    dependencies: [3],
  },
] as const

/**
 * Get migration by version
 */
export const getMigrationByVersion = (
  version: number,
): Migration | undefined => {
  return migrations.find((m) => m.version === version)
}

/**
 * Get all migrations that need to run
 */
export const getMigrationsToRun = (
  currentVersion: number,
  targetVersion: number,
): Migration[] => {
  if (currentVersion >= targetVersion) {
    return []
  }

  return migrations.filter(
    (migration) =>
      migration.version > currentVersion && migration.version <= targetVersion,
  )
}

/**
 * Validate migration dependencies
 */
export const validateMigrationDependencies = (
  migration: Migration,
  completedVersions: number[],
): boolean => {
  if (!migration.dependencies || migration.dependencies.length === 0) {
    return true
  }

  const missingDependencies = migration.dependencies.filter(
    (dep) => !completedVersions.includes(dep),
  )

  if (missingDependencies.length > 0) {
    logger.error('Migration dependencies not met', {
      migration: migration.name,
      version: migration.version,
      missingDependencies,
      completedVersions,
    })
    return false
  }

  return true
}

/**
 * Get all migrations sorted by version
 */
export const getSortedMigrations = (): Migration[] => {
  return [...migrations].sort((a, b) => a.version - b.version)
}
