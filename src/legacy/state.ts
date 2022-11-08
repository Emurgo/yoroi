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
    acceptedTos: boolean
    installationId: string | null | undefined
    customPinHash: string | null | undefined
    sendCrashReports: boolean
  }
  serverStatus: ServerStatus
}
export const getInitialState = (): State => ({
  appSettings: {
    acceptedTos: false,
    installationId: null,
    customPinHash: null,
    sendCrashReports: false,
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
