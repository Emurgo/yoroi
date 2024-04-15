import {handleEvent} from './resolver'
import {connectWallet} from './connector'
import {DappConnection, Storage} from './adapters/async-storage'

export const dappConnectorMaker = (storage: Storage, wallet: Wallet): DappConnector => {
  return new DappConnector(storage, wallet)
}

export class DappConnector {
  constructor(private storage: Storage, private wallet: Wallet) {}

  public listAllConnections = async () => {
    return this.storage.read()
  }

  public removeConnection = async (connection: DappConnection) => {
    return this.storage.remove(connection)
  }

  public addConnection = async (options: {dappOrigin: string; walletId?: string}) => {
    return this.storage.save({walletId: options.walletId ?? this.wallet.id, dappOrigin: options.dappOrigin})
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
    sendMessage: (id: string, result: unknown, error?: Error) => void,
  ) => {
    return await handleEvent(eventData, trustedUrl, this.wallet, sendMessage, this.storage)
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
