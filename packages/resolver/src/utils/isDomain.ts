import {isAdaHandleDomain} from '../adapters/handle-api'

export const isDomain = (resolve: string) =>
  isAdaHandleDomain(resolve) || resolve.includes('.')
