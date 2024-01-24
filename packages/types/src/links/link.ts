export interface LinksUriConfig {
  readonly scheme: 'web+cardano'
  readonly authority: '' | 'transfer' | 'claim'
  readonly version: 'v1' | ''
  readonly rules: {
    readonly requiredParams: ReadonlyArray<string>
    readonly optionalParams: ReadonlyArray<string>
    readonly forbiddenParams: ReadonlyArray<string>
    readonly extraParams: 'include' | 'deny' | 'drop'
  }
}

export type LinksParams = Readonly<Record<string, any>>

export type LinksLink<T extends LinksUriConfig> = Readonly<{
  config: T
  params: LinksParams
  link: string
}>

export type LinksModule<T extends LinksUriConfig> = Readonly<{
  create: (args: {config: T; params: LinksParams}) => LinksLink<T>
  parse: (text: string) => LinksLink<T> | undefined
}>
