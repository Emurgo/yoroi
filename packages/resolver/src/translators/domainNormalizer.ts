import {adaHandleDomainNormalizer} from './handle/adaHandleDomainNormalizer'

export const domainNormalizer = (policyId: string, domain: string) => {
  const normalizers = {
    ...adaHandleDomainNormalizer,
  }

  const normalizer = normalizers[policyId]

  return normalizer?.(domain) ?? domain
}
