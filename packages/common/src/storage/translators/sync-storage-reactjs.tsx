import React from 'react'
import {App} from '@yoroi/types'

import {invalid} from '../../errors/errors'
import {mountMMKVStorage} from '../adapters/mmkv-storage'

const SyncStorageContext = React.createContext<undefined | App.Storage<false>>(
  undefined,
)
export const SyncStorageProvider = ({
  children,
  storage = mountMMKVStorage({path: '/'}),
}: {
  storage?: App.Storage<false>
  children: React.ReactNode
}) => {
  return (
    <SyncStorageContext.Provider value={storage}>
      {children}
    </SyncStorageContext.Provider>
  )
}

export const useSyncStorage = () =>
  React.useContext(SyncStorageContext) ?? invalid('Missing SyncStorageProvider')
