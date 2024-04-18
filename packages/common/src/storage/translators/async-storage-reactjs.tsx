import React from 'react'
import {App} from '@yoroi/types'

import {invalid} from '../../errors/errors'
import {mountAsyncStorage} from '../adapters/async-storage'

const AsyncStorageContext = React.createContext<undefined | App.Storage>(
  undefined,
)
export const AsyncStorageProvider = ({
  children,
  storage = mountAsyncStorage({path: '/'}),
}: {
  storage?: App.Storage
  children: React.ReactNode
}) => {
  return (
    <AsyncStorageContext.Provider value={storage}>
      {children}
    </AsyncStorageContext.Provider>
  )
}

export const useAsyncStorage = () =>
  React.useContext(AsyncStorageContext) ??
  invalid('Missing AsyncStorageProvider')
