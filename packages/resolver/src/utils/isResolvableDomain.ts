import {isUnstoppableHandleDomain} from '../adapters/unstoppable-api'
import {isAdaHandleDomain} from '../adapters/handle-api'
import {isCnsDomain} from '../adapters/cns'

export const isResolvableDomain = (domain: string): boolean =>
  isAdaHandleDomain(domain) ||
  isUnstoppableHandleDomain(domain) ||
  isCnsDomain(domain)
