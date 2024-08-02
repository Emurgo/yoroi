import AsyncStorage from '@react-native-async-storage/async-storage'
import {BaseStorage} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export type Storage = {
  read(): Promise<DappConnection[]>
  remove(connection: DappConnection): Promise<void>
  save(connection: DappConnection): Promise<void>
  key: string
}

const key = 'dapp-connections'

export const connectionStorageMaker = (deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps): Storage => {
  const {storage} = deps

  const save = async (connection: DappConnection) => {
    const connections = await read()

    const containsConnection = connections.some((c) => areConnectionsEqual(c, connection))
    if (containsConnection) {
      throw new Error(`Connection already exists: ${JSON.stringify(connection)}`)
    }

    const newConnections = [...connections, connection]
    await storage.setItem(key, JSON.stringify(newConnections))
  }

  const read = async (): Promise<DappConnection[]> => {
    const connections = await storage.getItem(key)
    const parsed: Partial<DappConnection>[] = connections ? JSON.parse(connections) : []
    return parsed.map(normaliseDappConnection)
  }

  const remove = async (connection: DappConnection) => {
    const connections = await read()
    const newConnections = connections.filter((c) => !areConnectionsEqual(c, connection))
    await storage.setItem(key, JSON.stringify(newConnections))
  }

  return {
    read,
    remove,
    save,
    key,
  }
}

const areConnectionsEqual = (a: DappConnection, b: DappConnection) =>
  a.walletId === b.walletId && a.dappOrigin === b.dappOrigin && a.chainId === b.chainId

const normaliseDappConnection = (connection: Partial<DappConnection>): DappConnection => {
  const {walletId, dappOrigin, chainId} = connection

  if (!walletId) {
    throw new Error('connectionStorageMaker.normaliseDappConnection: walletId is required')
  }

  if (!dappOrigin) {
    throw new Error('connectionStorageMaker.normaliseDappConnection: dappOrigin is required')
  }

  if (!chainId) {
    return {walletId, dappOrigin, chainId: 1}
  }

  return {walletId, dappOrigin, chainId}
}

export interface DappConnection {
  walletId: string
  dappOrigin: string
  chainId: number
}
