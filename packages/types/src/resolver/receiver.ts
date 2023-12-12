import {ResolverNameServer} from './service'

export type ResolverReceiver = {
  receiver: string
  isDomain: boolean
  selectedNameServer: ResolverNameServer | undefined
  addressRecords: {[key in ResolverNameServer]?: string} | undefined
}
