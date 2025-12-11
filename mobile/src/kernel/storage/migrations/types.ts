import {App} from '@yoroi/types'

/**
 * Migration function signature
 * Must be idempotent and safe to run multiple times
 */
export type MigrationFunction = (storage: App.Storage) => Promise<void>

/**
 * Migration validation function
 * Returns true if migration should run, false if already applied
 */
export type MigrationValidator = (storage: App.Storage) => Promise<boolean>

/**
 * Migration rollback function (optional)
 * Should restore storage to previous state if migration fails
 */
export type MigrationRollback = (storage: App.Storage) => Promise<void>

/**
 * Migration definition
 */
export type Migration = {
  /** Migration version number (must be unique and sequential) */
  version: number
  /** Human-readable name for logging */
  name: string
  /** Migration function to execute */
  migrate: MigrationFunction
  /** Optional validator to check if migration is needed */
  validate?: MigrationValidator
  /** Optional rollback function */
  rollback?: MigrationRollback
  /** Description of what this migration does */
  description?: string
  /** Dependencies on previous migrations (versions that must exist) */
  dependencies?: number[]
}

/**
 * Migration result
 */
export type MigrationResult =
  | {
      success: true
      version: number
      name: string
    }
  | {
      success: false
      version: number
      name: string
      error: Error
    }

/**
 * Migration execution context
 */
export type MigrationContext = {
  storage: App.Storage
  currentVersion: number
  targetVersion: number
  migrations: Migration[]
}
