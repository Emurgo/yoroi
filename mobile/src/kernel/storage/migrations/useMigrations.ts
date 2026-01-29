import {App} from '@yoroi/types'
import {recoverOrphanedWallets} from '@yoroi/wallet-manager'

import * as React from 'react'

import {logger} from '~/kernel/logger/logger'
import {clearRecoverableStorage} from '~/kernel/storage/storages'

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
    let isAborted = false // Tracks if this attempt was aborted (timeout/error triggered retry)
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Validate migration registry on first run
    if (!validateMigrationRegistry()) {
      logger.error('useMigrations: Migration registry validation failed')
    }

    const safeClearStorage = async () => {
      try {
        await clearRecoverableStorage()
        // After clearing recoverable storage, attempt to recover orphaned wallets
        // This rebuilds wallet metadata for wallets that have keys but lost their metadata
        const recoveryResult = await recoverOrphanedWallets(storage)
        if (recoveryResult.recoveredCount > 0) {
          logger.info(
            'useMigrations: Recovered orphaned wallets after storage clear',
            {
              recoveredCount: recoveryResult.recoveredCount,
              walletIds: recoveryResult.walletIds,
            },
          )
        }
      } catch (error) {
        logger.error(
          'useMigrations: clearRecoverableStorage threw unexpectedly',
          {
            error,
          },
        )
      }
    }

    const executeMigrations = async () => {
      // Set up timeout
      const timeoutPromise = new Promise<'timeout'>((resolve) => {
        timeoutId = setTimeout(() => resolve('timeout'), MIGRATION_TIMEOUT_MS)
      })

      try {
        const migrationPromise = runMigrations(storage)
        const result = await Promise.race([migrationPromise, timeoutPromise])

        // Check if this attempt was aborted or component unmounted
        if (!isMounted || isAborted) return

        // Handle timeout
        if (result === 'timeout') {
          isAborted = true // Mark aborted to ignore late migration completion
          logger.error('useMigrations: Migration timeout', {
            timeout: MIGRATION_TIMEOUT_MS,
            retryCount,
          })

          if (retryCount < MAX_RETRY_ATTEMPTS) {
            logger.warn('useMigrations: Clearing storage due to timeout')
            await safeClearStorage()
            if (isMounted) setRetryCount((c) => c + 1)
            return
          }

          // Max retries exceeded
          logger.error('useMigrations: Max retries exceeded after timeout')
          await safeClearStorage()
          if (isMounted) setDone(true)
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
            isAborted = true
            logger.warn('useMigrations: Critical failure, clearing storage')
            await safeClearStorage()
            if (isMounted) setRetryCount((c) => c + 1)
            return
          }

          // Non-critical failures or max retries - continue anyway
          logger.warn('useMigrations: Continuing despite migration failures', {
            failedCount: failed.length,
          })
        }

        // Success (or acceptable failures)
        if (isMounted) setDone(true)
      } catch (err) {
        // Check if this attempt was aborted or component unmounted
        if (!isMounted || isAborted) return

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
          migrationError.message.includes('integrity') ||
          migrationError.message.includes('version')

        if (isStorageError && retryCount < MAX_RETRY_ATTEMPTS) {
          isAborted = true
          logger.warn('useMigrations: Storage error, clearing and retrying')
          await safeClearStorage()
          if (isMounted) setRetryCount((c) => c + 1)
          return
        }

        // Max retries exceeded or non-storage error - clear and continue
        logger.error('useMigrations: Unrecoverable error, clearing storage')
        await safeClearStorage()
        if (isMounted) setDone(true)
      }
    }

    executeMigrations()

    return () => {
      isMounted = false
      isAborted = true // Abort any in-flight operations
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [storage, retryCount])

  return done
}
