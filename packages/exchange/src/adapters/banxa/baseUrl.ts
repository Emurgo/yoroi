import {Exchange} from '@yoroi/types'
import {
  banxaDomainProduction,
  banxaDomainSandbox,
} from '../../translators/banxa/domains'

export const generateBanxaBaseUrl = (
  isProduction: Exchange.ReferralUrlBuilderOptions['isProduction'],
  partner: string,
) => {
  const domain = isProduction ? banxaDomainProduction : banxaDomainSandbox
  const baseUrl = `https://${partner}.${domain}`

  return baseUrl
}
