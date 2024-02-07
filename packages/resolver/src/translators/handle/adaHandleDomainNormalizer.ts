import {handleApiConfig} from '../../adapters/handle/api'

export const adaHandleDomainNormalizer: Record<
  string,
  (domain: string) => string
> = {
  [handleApiConfig.mainnet.policyId]: (domain: string) => {
    if (!domain.startsWith('$')) return `$${domain}`
    return domain
  },
}
