import {
  mountAsyncStorage,
  mountMMKVStorage,
  observableStorageMaker,
} from '@yoroi/common'
import {themeStorageMaker} from '@yoroi/theme'
import {MMKV} from 'react-native-mmkv'
import {of} from 'rxjs'

import {debugStorage} from './debug-storage'

export const rootStorage = mountAsyncStorage({path: '/'})

const rootMMKV = new MMKV({id: 'default.mmkv'})
export const rootSyncStorage = observableStorageMaker<false, string>(
  mountMMKVStorage({path: '/'}, {instance: rootMMKV}),
)

const themeObservableStorage = observableStorageMaker(
  rootSyncStorage.join('theme/'),
)
export const themeStorage = themeStorageMaker({
  storage: themeObservableStorage,
})

if (__DEV__) debugStorage(rootMMKV)
if (__DEV__) debugStorage(rootStorage)

const observableFunction = (v: unknown) => {
  console.log(v)
  return of(null)
}

rootSyncStorage.observable.subscribe((v) => observableFunction(v))
themeObservableStorage.observable.subscribe((v) => {
  observableFunction(v)
  // Debug storage whenever theme changes
  debugStorage(rootMMKV)
})
