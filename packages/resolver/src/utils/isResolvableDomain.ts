import {isUnstoppableHandleDomain} from '../adapters/unstoppable-api'
import {isAdaHandleDomain} from '../adapters/handle-api'
import {isCnsDomain} from '../adapters/cns'

export const isResolvableDomain = (resolve: string) =>
  isAdaHandleDomain(resolve) ||
  isUnstoppableHandleDomain(resolve) ||
  isCnsDomain(resolve)
