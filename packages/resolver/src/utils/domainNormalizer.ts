import {adaHandleDomainNormalizer} from '../adapters/handle/api'

export const domainNormalizer = (policyId: string, domain: string) => {
  const normalizers = {
    ...adaHandleDomainNormalizer,
  }

  const normalizer = normalizers[policyId]

  return normalizer?.(domain) ?? domain
}
