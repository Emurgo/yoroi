import {DappConnection, Storage} from './storage'
import {handleEvent} from './resolver'
/* eslint-disable @typescript-eslint/no-explicit-any */
import {connectWallet} from './connector'

export class DappConnector {
  constructor(private storage: Storage) {}

  public listAllConnections = async () => {
    return this.storage.listAllConnections()
  }

  public removeConnection = async (connection: DappConnection) => {
    return this.storage.removeConnection(connection)
  }

  public addConnection = async (connection: DappConnection) => {
    return this.storage.addConnection(connection)
  }

  public getWalletConnectorScript = (props: {
    iconUrl: string
    apiVersion: string
    walletName: string
    sessionId: string
  }) => {
    return connectWallet({...props, supportedExtensions})
  }

  public handleEvent = async (
    eventData: string,
    trustedUrl: string,
    wallet: Wallet,
    sendMessage: (id: string, result: unknown, error?: Error) => void,
  ) => {
    return await handleEvent(eventData, trustedUrl, wallet, sendMessage, this.storage)
  }
}

type SupportedExtension = {
  cip: number
}

const supportedExtensions: SupportedExtension[] = []

type Wallet = {
  id: string
  networkId: number
  confirmConnection: (dappOrigin: string) => Promise<boolean>
}
