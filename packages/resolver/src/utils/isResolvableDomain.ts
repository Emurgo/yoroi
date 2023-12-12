import {isUnstoppableHandleDomain} from '../adapters/unstoppable-api'
import {isAdaHandleDomain} from '../adapters/handle-api'
import {isCnsDomain} from '../adapters/cns'

export const isResolvableDomain = (receiver: string): boolean =>
  isAdaHandleDomain(receiver) ||
  isUnstoppableHandleDomain(receiver) ||
  isCnsDomain(receiver)
