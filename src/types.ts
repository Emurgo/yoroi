import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  walletImplementationId: number
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
}
