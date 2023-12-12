import {ResolverNameServer} from './service'

export type ResolverReceiver = {
  resolve: string
  as: 'domain' | 'address'
  selectedNameServer: ResolverNameServer | undefined
  addressRecords: {[key in ResolverNameServer]?: string} | undefined
}
