import {Chain} from '@yoroi/types'

import {DappConnectorManager} from './dapp-connector'

export const managerMock: DappConnectorManager = {
  network: Chain.Network.Mainnet,
  walletId: 'walletId',
  listAllConnections(): Promise<[]> {
    return Promise.resolve([])
  },
  removeConnection(): Promise<void> {
    return Promise.resolve()
  },
  removeConnections(
    _options: Array<{walletId?: string; dappOrigin: string}>,
  ): Promise<void> {
    return Promise.resolve()
  },
  addConnection(): Promise<void> {
    return Promise.resolve()
  },
  getWalletConnectorScript(): string {
    return ''
  },
  handleEvent(): Promise<void> {
    return Promise.resolve()
  },
}
