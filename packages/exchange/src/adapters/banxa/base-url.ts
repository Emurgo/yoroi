import {Exchange} from '@yoroi/types'
import {
  banxaDomainProduction,
  banxaDomainSandbox,
} from '../../translators/banxa/domains'

export const generateBanxaBaseUrl = (
  isProduction: Exchange.ManagerOptions['isProduction'],
  partner: string,
) => {
  const domain = isProduction ? banxaDomainProduction : banxaDomainSandbox
  const baseUrl = `https://${partner}.${domain}`

  return baseUrl
}
