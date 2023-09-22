import React from 'react'
import {App} from '@yoroi/types'

import {rootStorage} from '../adapters/rootStorage'
import {invalid} from '../../errors/errors'

const StorageContext = React.createContext<undefined | App.Storage>(undefined)
export const StorageProvider = ({
  children,
  storage = rootStorage,
}: {
  storage?: App.Storage
  children: React.ReactNode
}) => {
  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  )
}

export const useStorage = () =>
  React.useContext(StorageContext) ?? invalid('Missing StorageProvider')
