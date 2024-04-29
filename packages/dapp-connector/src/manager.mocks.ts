import {DappConnectorManager} from './dapp-connector'
import {DappListResponse} from './adapters/api'

export const managerMock: DappConnectorManager = {
  getDAppList(): Promise<DappListResponse> {
    return Promise.resolve(mockedDAppList)
  },
  listAllConnections(): Promise<[]> {
    return Promise.resolve([])
  },
  removeConnection(): Promise<void> {
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

export const mockedDAppList = {
  dapps: [
    {
      id: 'example',
      description: 'Example DApp',
      logo: 'icon.png',
      name: 'Example DApp',
      category: 'example',
      uri: 'https://example.com',
      origins: ['https://example.com'],
    },
  ],
  filters: {'Category 1': ['Example 1', 'Example 2']},
}
