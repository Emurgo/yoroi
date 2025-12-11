export const ResolverNameServer = {
  Cns: 'cns',
  Unstoppable: 'unstoppable',
  Handle: 'handle',
} as const

export type ResolverNameServer =
  (typeof ResolverNameServer)[keyof typeof ResolverNameServer]
