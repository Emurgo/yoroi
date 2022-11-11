import type {CardanoTypes, ServerStatus} from '../yoroi-wallets'
import type {NetworkId, WalletImplementationId, YoroiProvider} from '../yoroi-wallets/types/other'

export type WalletMeta = {
  id: string
  name: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  isHW: boolean
  isShelley?: boolean | null | undefined
  // legacy jormungandr
  isEasyConfirmationEnabled: boolean
  checksum: CardanoTypes.WalletChecksum
  provider?: YoroiProvider | null | undefined
}
export type State = {
  appSettings: {
    installationId: string | null | undefined
    customPinHash: string | null | undefined
  }
  serverStatus: ServerStatus
}
export const getInitialState = (): State => ({
  appSettings: {
    installationId: null,
    customPinHash: null,
  },
  serverStatus: {
    isServerOk: true,
    isMaintenance: false,
    serverTime: undefined,
    isQueueOnline: false,
  },
})
export const mockState = (mockedState?: State | null | undefined): State => {
  if (!__DEV__) {
    throw new Error('calling mockState in a production build')
  }

  return {
    ...getInitialState(),
    ...mockedState,
  }
}
export default getInitialState
