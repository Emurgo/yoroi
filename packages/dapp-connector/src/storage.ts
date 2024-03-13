import {App} from '@yoroi/types'

export const connectionStorageMaker = (storage: App.Storage): Storage => {
  const listConnections = () => storage.getItem<DappConnection[]>('connections') || []
  const removeConnection = async (connection: DappConnection) => {
    const connections = await listConnections()
    const newConnections = connections.filter(
      (c) => c.dappOrigin !== connection.dappOrigin && c.walletId !== connection.walletId,
    )
    await storage.setItem('connections', newConnections)
  }
  const addConnection = async (connection: DappConnection) => {
    const connections = await listConnections()
    const newConnections = [...connections, connection]
    await storage.setItem('connections', newConnections)
  }
  return {
    listConnections,
    removeConnection,
    addConnection,
  }
}

export interface DappConnection {
  walletId: string
  dappOrigin: string
}

export interface Storage {
  listConnections(): Promise<DappConnection[]>
  removeConnection(connection: DappConnection): Promise<void>
  addConnection(connection: DappConnection): Promise<void>
}
