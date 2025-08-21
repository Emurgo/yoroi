import {isCnsDomain} from '../adapters/cns/api'
import {isAdaHandleDomain} from '../adapters/handle/api'
import {isUnstoppableDomain} from '../adapters/unstoppable/api'

export const isResolvableDomain = (resolve: string) =>
  isAdaHandleDomain(resolve) ||
  isUnstoppableDomain(resolve) ||
  isCnsDomain(resolve)
