import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'

export type Storage = typeof AsyncStorage
const StorageContext = React.createContext<undefined | Storage>(undefined)
export const StorageProvider = ({children, storage = AsyncStorage}: {storage?: Storage; children: React.ReactNode}) => {
  return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
}

export const useStorage = () => React.useContext(StorageContext) || invalid()

const invalid = () => {
  throw new Error('Missing StorageProvider')
}

export const SettingsStorageKeys = {
  OldAuthWithOs: '/appSettings/isSystemAuthEnabled', // deprecated, need for migrations
  InstallationId: '/appSettings/installationId',
  Pin: '/appSettings/customPinHash',
  Auth: '/appSettings/auth',
} as const
