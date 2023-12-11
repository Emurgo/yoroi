import {ResolverService} from './service'

export type ResolverReceiver = {
  domain: string
  isDomain: boolean
  selectedService: ResolverService | undefined
  addresses: {[key in ResolverService]?: string} | undefined
}
