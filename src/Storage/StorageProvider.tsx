import React from 'react'

import {storage as rootStorage, YoroiStorage} from '../yoroi-wallets/storage'

const StorageContext = React.createContext<undefined | YoroiStorage>(undefined)
export const StorageProvider = ({
  children,
  storage = rootStorage,
}: {
  storage?: YoroiStorage
  children: React.ReactNode
}) => {
  return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
}

export const useStorage = () => React.useContext(StorageContext) || invalid()

const invalid = () => {
  throw new Error('Missing StorageProvider')
}
