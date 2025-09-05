import {App} from '@yoroi/types'

import {installationIdStorageKeyManager} from '~/kernel/storage/storages'

export const migrateInstallationId = async (storage: App.Storage) => {
  if (installationIdStorageKeyManager.read()) return

  const oldInstallationId = await storage
    .join('appSettings/')
    .getItem<string>('installationId')

  if (oldInstallationId != null) {
    installationIdStorageKeyManager.save(oldInstallationId)
  }
}

export const to6_0_0 = migrateInstallationId
