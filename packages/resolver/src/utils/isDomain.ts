import {isAdaHandleDomain} from '../adapters/handle-api'

export const isDomain = (receiver: string): boolean => {
  return /.+\..+/.test(receiver) || isAdaHandleDomain(receiver)
}
