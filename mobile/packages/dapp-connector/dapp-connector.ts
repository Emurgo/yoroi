import {Chain} from '@yoroi/types'

import {freeze} from 'immer'

import {DappConnection, Storage} from './adapters/async-storage'
import {connectWallet} from './connector'
import {ResolverWallet, resolverHandleEvent} from './resolver'

export type DappConnectorManager = {
  listAllConnections(): Promise<DappConnection[]>
  removeConnection(options: {
    walletId?: string
    dappOrigin: string
  }): Promise<void>
  removeConnections(
    options: Array<{walletId?: string; dappOrigin: string}>,
  ): Promise<void>
  addConnection(options: {dappOrigin: string; walletId?: string}): Promise<void>
  getWalletConnectorScript(props: {
    iconUrl: string
    apiVersion: string
    walletName: string
    sessionId: string
  }): string
  handleEvent(
    eventData: string,
    trustedUrl: string,
    sendMessage: (id: string, result: unknown, error?: Error) => void,
  ): Promise<void>
  readonly network: Chain.SupportedNetworks
  readonly walletId: string
}

export type DappConnector = DappConnectorManager

export const dappConnectorMaker = (
  storage: Storage,
  wallet: ResolverWallet,
): DappConnector => {
  const removeConnection = async (options: {
    walletId?: string
    dappOrigin: string
  }) => {
    const walletId = options.walletId ?? wallet.id
    return storage.remove({
      walletId,
      dappOrigin: options.dappOrigin,
      network: wallet.network,
    })
  }

  return {
    network: wallet.network,
    walletId: wallet.id,

    async listAllConnections() {
      return storage.read()
    },

    removeConnection,

    async removeConnections(
      options: Array<{walletId?: string; dappOrigin: string}>,
    ) {
      for (const o of options) {
        await removeConnection(o)
      }
    },

    async addConnection(options: {
      dappOrigin: string
      walletId?: string
      network?: Chain.Network
    }) {
      const walletId = options.walletId ?? wallet.id
      const network = options.network ?? wallet.network
      return storage.save({
        walletId,
        dappOrigin: options.dappOrigin,
        network,
      })
    },

    getWalletConnectorScript(props: {
      iconUrl: string
      apiVersion: string
      walletName: string
      sessionId: string
    }) {
      return connectWallet({...props, supportedExtensions})
    },

    async handleEvent(
      eventData: string,
      trustedUrl: string,
      sendMessage: (id: string, result: unknown, error?: Error) => void,
    ) {
      return await resolverHandleEvent(
        eventData,
        trustedUrl,
        wallet,
        sendMessage,
        storage,
        supportedExtensions,
      )
    },
  }
}

type SupportedExtension = {
  cip: number
}

const supportedExtensions: ReadonlyArray<SupportedExtension> = freeze(
  [{cip: 30}, {cip: 95}],
  true,
)
