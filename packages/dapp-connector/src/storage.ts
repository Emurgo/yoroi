import {App} from '@yoroi/types'

export const connectionStorageMaker = (storage: App.Storage): Storage => {
  const listAllConnections = async () => (await storage.getItem<DappConnection[]>('connections')) || []

  const removeConnection = async (connection: DappConnection) => {
    const connections = await listAllConnections()
    const newConnections = connections.filter((c) => !areConnectionsEqual(c, connection))
    await storage.setItem('connections', newConnections)
  }

  const addConnection = async (connection: DappConnection) => {
    const connections = await listAllConnections()
    const newConnections = [...connections, connection]
    await storage.setItem('connections', newConnections)
  }

  return {
    listAllConnections,
    removeConnection,
    addConnection,
  }
}

const areConnectionsEqual = (a: DappConnection, b: DappConnection) =>
  a.walletId === b.walletId && a.dappOrigin === b.dappOrigin

export interface DappConnection {
  walletId: string
  dappOrigin: string
}

export interface Storage {
  listAllConnections(): Promise<DappConnection[]>
  removeConnection(connection: DappConnection): Promise<void>
  addConnection(connection: DappConnection): Promise<void>
}
