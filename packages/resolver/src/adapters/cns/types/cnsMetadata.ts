export interface CNSMetadata {
  name: string
  image: string
  expiry: number
  origin: string
  cnsType: string
  mediaType: string
  description: string
  virtualSubdomainLimits: number
  virtualSubdomainEnabled: 'Enabled' | 'Disabled'
}
