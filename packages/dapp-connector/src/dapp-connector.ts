import {resolverHandleEvent, ResolverWallet} from './resolver'
// @ts-ignore-next-line
import {connectWallet} from './connector'
import {DappConnection, Storage} from './adapters/async-storage'
import {Api, DappListResponse} from './adapters/api'

export type DappConnectorManager = {
  getDAppList(): Promise<DappListResponse>
  listAllConnections(): Promise<DappConnection[]>
  removeConnection(options: {walletId?: string; dappOrigin: string}): Promise<void>
  addConnection(options: {dappOrigin: string; walletId?: string}): Promise<void>
  getWalletConnectorScript(props: {iconUrl: string; apiVersion: string; walletName: string; sessionId: string}): string
  handleEvent(
    eventData: string,
    trustedUrl: string,
    sendMessage: (id: string, result: unknown, error?: Error) => void,
  ): Promise<void>
}

export const dappConnectorMaker = (storage: Storage, wallet: ResolverWallet, api: Api): DappConnector => {
  return new DappConnector(storage, wallet, api)
}

export class DappConnector implements DappConnectorManager {
  constructor(private storage: Storage, private wallet: ResolverWallet, private api: Api) {}

  async getDAppList() {
    return this.api.getDApps()
  }

  async listAllConnections() {
    return this.storage.read()
  }

  async removeConnection(options: {walletId?: string; dappOrigin: string}) {
    const walletId = options.walletId ?? this.wallet.id
    return this.storage.remove({walletId, dappOrigin: options.dappOrigin})
  }

  async addConnection(options: {dappOrigin: string; walletId?: string}) {
    const walletId = options.walletId ?? this.wallet.id
    return this.storage.save({walletId, dappOrigin: options.dappOrigin})
  }

  getWalletConnectorScript(props: {iconUrl: string; apiVersion: string; walletName: string; sessionId: string}) {
    return connectWallet({...props, supportedExtensions})
  }

  async handleEvent(
    eventData: string,
    trustedUrl: string,
    sendMessage: (id: string, result: unknown, error?: Error) => void,
  ) {
    return await resolverHandleEvent(eventData, trustedUrl, this.wallet, sendMessage, this.storage, supportedExtensions)
  }
}

type SupportedExtension = {
  cip: number
}

const supportedExtensions: SupportedExtension[] = [{cip: 30}]
