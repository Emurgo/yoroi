import {App} from '@yoroi/types'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {clearAllStorage} from '~/kernel/storage/storages'

import {runMigrations, validateMigrationRegistry} from './runner'
import type {MigrationResult} from './types'

const MIGRATION_TIMEOUT_MS = 60_000 // 60 seconds max for all migrations
const MAX_RETRY_ATTEMPTS = 2

/**
 * React hook wrapper for migrations with timeout and automatic recovery
 * On unrecoverable errors, automatically clears storage and retries
 * Returns true when migrations complete (or storage was reset for fresh start)
 */
export const useMigrations = (storage: App.Storage): boolean => {
  const [done, setDone] = React.useState(false)
  const [retryCount, setRetryCount] = React.useState(0)

  React.useEffect(() => {
    let isMounted = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Validate migration registry on first run
    if (!validateMigrationRegistry()) {
      logger.error('useMigrations: Migration registry validation failed')
      // Continue anyway - individual migrations will fail gracefully
    }

    const executeMigrations = async () => {
      // Set up timeout to prevent infinite hang
      const timeoutPromise = new Promise<'timeout'>((resolve) => {
        timeoutId = setTimeout(() => resolve('timeout'), MIGRATION_TIMEOUT_MS)
      })

      try {
        const migrationPromise = runMigrations(storage)
        const result = await Promise.race([migrationPromise, timeoutPromise])

        if (!isMounted) return

        // Handle timeout - clear storage and retry
        if (result === 'timeout') {
          logger.error('useMigrations: Migration timeout', {
            timeout: MIGRATION_TIMEOUT_MS,
            retryCount,
          })

          if (retryCount < MAX_RETRY_ATTEMPTS) {
            logger.warn(
              'useMigrations: Clearing storage due to timeout and retrying',
            )
            await clearAllStorage()
            setRetryCount((c) => c + 1)
            return
          }

          // Max retries exceeded - clear and continue as fresh install
          logger.error(
            'useMigrations: Max retries exceeded, continuing as fresh install',
          )
          await clearAllStorage()
          setDone(true)
          return
        }

        // Handle migration results
        const results = result as MigrationResult[]
        const failed = results.filter(
          (r): r is MigrationResult & {success: false} => !r.success,
        )

        if (failed.length > 0) {
          const failedInfo = failed.map((f) => ({
            version: f.version,
            name: f.name,
            error: f.error.message,
          }))

          logger.error('useMigrations: Some migrations failed', {
            failed: failedInfo,
          })

          // Check if failures are critical (storage-related)
          const hasCriticalFailure = failed.some(
            (f) =>
              f.error.message.includes('corrupt') ||
              f.error.message.includes('MMKV') ||
              f.error.message.includes('storage') ||
              f.error.message.includes('getAllKeys') ||
              f.error.message.includes('multiGet'),
          )

          if (hasCriticalFailure && retryCount < MAX_RETRY_ATTEMPTS) {
            logger.warn(
              'useMigrations: Critical migration failure, clearing storage and retrying',
            )
            await clearAllStorage()
            setRetryCount((c) => c + 1)
            return
          }

          // Non-critical failures or max retries - continue anyway
          // App may have limited functionality but won't be stuck
          logger.warn('useMigrations: Continuing despite migration failures', {
            failedCount: failed.length,
          })
        }

        // Success (or acceptable failures)
        setDone(true)
      } catch (err) {
        if (!isMounted) return

        const migrationError =
          err instanceof Error ? err : new Error(String(err))
        logger.error('useMigrations: Migration execution failed', {
          error: migrationError,
          retryCount,
        })

        // Check if this is a storage corruption error
        const isStorageError =
          migrationError.message.includes('corrupt') ||
          migrationError.message.includes('MMKV') ||
          migrationError.message.includes('storage') ||
          migrationError.message.includes('integrity')

        if (isStorageError && retryCount < MAX_RETRY_ATTEMPTS) {
          logger.warn(
            'useMigrations: Storage error detected, clearing storage and retrying',
          )
          await clearAllStorage()
          setRetryCount((c) => c + 1)
          return
        }

        // Max retries exceeded or non-storage error - clear and continue
        logger.error(
          'useMigrations: Unrecoverable error, clearing storage and continuing as fresh install',
        )
        await clearAllStorage()
        setDone(true)
      }
    }

    executeMigrations()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [storage, retryCount])

  return done
}
