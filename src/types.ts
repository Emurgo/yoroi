import type {IntlShape} from 'react-intl'

export interface WalletInterface {
  changePassword(masterPassword: string, newPassword: string, intl: IntlShape): Promise<void>
}
