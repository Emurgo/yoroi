export interface ResolverApi {
  getCryptoAddresses(
    receiver: string,
    network: 'preprod' | 'mainnet',
  ): Promise<Array<{address: string | null; error: string | null}>>
}
