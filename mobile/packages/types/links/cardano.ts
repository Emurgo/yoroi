export type LinksUriRules = {
  readonly requiredParams: ReadonlyArray<string>
  readonly optionalParams: ReadonlyArray<string>
  readonly forbiddenParams: ReadonlyArray<string>
  readonly extraParams: 'include' | 'deny' | 'drop'
}

export type LinksUriConfig = {
  readonly rules: LinksUriRules

  readonly scheme?: string
  readonly authority?: string
  readonly version?: string
  readonly path?: string
}

export type LinksWebCardanoUriConfig = LinksUriConfig & {
  readonly scheme: 'web+cardano'
  readonly authority:
    | ''
    | 'transfer'
    | 'claim'
    | 'browse'
    | 'pay'
    | 'payment'
    | 'stake'
    | 'drep'
    | 'transaction'
    | 'block'
    | 'address'
    | 'connect'
    | 'wallet'
  readonly version: 'v1' | ''
}

export type LinksParams = Readonly<Record<string, unknown>>

export type LinksLink<T extends LinksUriConfig> = Readonly<{
  config: T
  params: LinksParams
  link: string
}>

export type LinksModule<T extends LinksUriConfig> = Readonly<{
  create: (args: {config: T; params: LinksParams}) => LinksLink<T>
  parse: (text: string) => LinksLink<T> | undefined
}>
