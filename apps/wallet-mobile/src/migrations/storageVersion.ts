import {isNumber} from '@yoroi/common'
import {App} from '@yoroi/types'
import {freeze} from 'immer'

const lastStorageVersion = 2
const keyStorageVersion = 'storageVersion'

export const storageVersionMaker = (storage: App.Storage) => {
  return freeze(
    {
      async save(storageVersion: number) {
        if (storageVersion > lastStorageVersion)
          throw new Error(
            'Invalid storage version, you forgot to update the lastStorageVersion constant in storageVersion',
          )
        return storage.setItem(keyStorageVersion, storageVersion)
      },
      async read() {
        return storage.getItem(keyStorageVersion).then((version) => (isNumber(version) ? version : 0))
      },
      async newInstallation() {
        return storage.setItem(keyStorageVersion, lastStorageVersion)
      },
      async remove() {
        return storage.removeItem(keyStorageVersion)
      },
    },
    true,
  )
}
