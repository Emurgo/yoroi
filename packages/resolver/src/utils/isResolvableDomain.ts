import {isUnstoppableDomain} from '../adapters/unstoppable/api'
import {isAdaHandleDomain} from '../adapters/handle/api'
import {isCnsDomain} from '../adapters/cns/api'

export const isResolvableDomain = (resolve: string) =>
  isAdaHandleDomain(resolve) ||
  isUnstoppableDomain(resolve) ||
  isCnsDomain(resolve)
