import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'

export type Storage = typeof AsyncStorage
const StorageContext = React.createContext<undefined | Storage>(undefined)
export const StorageProvider: React.FC<{storage?: Storage}> = ({children, storage = AsyncStorage}) => {
  return <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
}

export const useStorage = () => React.useContext(StorageContext) || invalid()

const invalid = () => {
  throw new Error('Missing StorageProvider')
}
