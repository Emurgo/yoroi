import {isNumber} from '@yoroi/common'
import {App} from '@yoroi/types'
import {freeze} from 'immer'

import {ErrorMigrationVersion} from './errors'

const currentVersion = 2
const keyStorageVersion = 'storageVersion'

export const storageVersionMaker = (storage: App.Storage) => {
  return freeze(
    {
      async save(storageVersion: number) {
        // should save the last version always after migration, can't be higher than currentVersion
        if (storageVersion > currentVersion) throw new ErrorMigrationVersion()
        return storage.setItem(keyStorageVersion, storageVersion)
      },
      async read() {
        return storage.getItem(keyStorageVersion).then((version) => (isNumber(version) ? version : 0))
      },
      async newInstallation() {
        return storage.setItem(keyStorageVersion, currentVersion)
      },
      async remove() {
        return storage.removeItem(keyStorageVersion)
      },
      key: keyStorageVersion,
      current: currentVersion,
    },
    true,
  )
}
