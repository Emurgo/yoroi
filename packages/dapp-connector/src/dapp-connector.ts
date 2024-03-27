import {handleEvent} from './resolver'
import {connectWallet} from './connector'
import {DappConnection, Storage} from './adapters/async-storage'

export class DappConnector {
  constructor(private storage: Storage) {}

  public listAllConnections = async () => {
    return this.storage.read()
  }

  public removeConnection = async (connection: DappConnection) => {
    return this.storage.remove(connection)
  }

  public addConnection = async (connection: DappConnection) => {
    return this.storage.save(connection)
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
