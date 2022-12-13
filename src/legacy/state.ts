import type {CardanoTypes} from '../yoroi-wallets'
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
  }
}
export const getInitialState = (): State => ({
  appSettings: {
    installationId: null,
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
