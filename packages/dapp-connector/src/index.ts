import {connectionStorageMaker, type Storage} from './adapters/async-storage'
import {DappConnector} from './dapp-connector'
export {connectionStorageMaker, type Storage, DappConnector}

export const dappConnectorMaker = (storage: Storage): DappConnector => {
  return new DappConnector(storage)
}
