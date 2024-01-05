/* istanbul ignore file */
export type CNSUserRecord = ConStr<
  0,
  [
    AssocMap<BuiltinByteString, PubKeyAddress | ScriptAddress>,
    AssocMap<BuiltinByteString, BuiltinByteString>,
    AssocMap<BuiltinByteString, BuiltinByteString>,
  ]
>

export type ParsedCNSUserRecord = {
  virtualSubdomains: string[][]
}

export type ConStr<N extends number, T> = {constructor: N; fields: T}
export type BuiltinByteString = {bytes: string}
export type Integer = {int: number}
export type ValidatorHash = BuiltinByteString
export type PaymentPubKeyHash = BuiltinByteString
export type PubKeyHash = PaymentPubKeyHash
export type POSIXTime = Integer
export type MaybeStakingHash =
  | ConStr<1, []>
  | ConStr<0, [ConStr<0, ConStr<0, BuiltinByteString[]>[]>]>
export type PubKeyAddress = ConStr<
  0,
  [ConStr<0, [PubKeyHash]>, MaybeStakingHash]
>
export type ScriptAddress = ConStr<
  0,
  [ConStr<1, [ValidatorHash]>, MaybeStakingHash]
>
export type AssetClass = {
  constructor: 0
  fields: [{bytes: string}, {bytes: string}]
}
export type AssocMapItem<K, V> = {k: K; v: V}
export type AssocMap<K, V> = {map: AssocMapItem<K, V>[]}
export type Tuple<K, V> = ConStr<0, [K, V]>
export type PlutusData =
  | BuiltinByteString
  | Integer
  | MaybeStakingHash
  | ScriptAddress
  | AssetClass
  | PaymentPubKeyHash
  | PubKeyHash
  | POSIXTime

export const conStr = <N extends number, T>(
  constructor: N,
  fields: T,
): ConStr<N, T> => ({
  constructor,
  fields,
})

export const conStr0 = <T>(fields: T) => conStr<0, T>(0, fields)
export const conStr1 = <T>(fields: T) => conStr<1, T>(1, fields)
export const conStr2 = <T>(fields: T) => conStr<2, T>(2, fields)
export const builtinByteString = (
  bytes: string | undefined,
): BuiltinByteString => {
  if (!bytes) throw new Error('Bad data')
  return {bytes}
}
export const maybeStakingHash = (stakeCredential: string): MaybeStakingHash => {
  if (stakeCredential === '') {
    return conStr1<[]>([])
  }
  return conStr0([conStr0([conStr0([builtinByteString(stakeCredential)])])])
}
export const pubKeyAddress = (
  bytes: string,
  stakeCredential?: string,
): PubKeyAddress =>
  conStr0<[ConStr<0, [BuiltinByteString]>, MaybeStakingHash]>([
    conStr0<[BuiltinByteString]>([builtinByteString(bytes)]),
    maybeStakingHash(stakeCredential || ''),
  ])
export const scriptAddress = (
  bytes: string,
  stakeCredential?: string,
): ScriptAddress =>
  conStr0<[ConStr<1, [BuiltinByteString]>, MaybeStakingHash]>([
    conStr1<[BuiltinByteString]>([builtinByteString(bytes)]),
    maybeStakingHash(stakeCredential || ''),
  ])
export const assetClass = (policyId: string, tokenName: string): AssetClass =>
  conStr0<[BuiltinByteString, BuiltinByteString]>([
    builtinByteString(policyId),
    builtinByteString(tokenName),
  ])
export const paymentPubKeyHash = (bytes: string): PaymentPubKeyHash =>
  builtinByteString(bytes)
export const pubKeyHash = (bytes: string): PubKeyHash =>
  builtinByteString(bytes)
export const posixTime = (int: number): POSIXTime => ({int})
export const integer = (int: number): Integer => ({int})
export const assocMap = <K, V>(itemsMap: [K, V][]): AssocMap<K, V> => ({
  map: itemsMap.map(([k, v]) => ({k, v})),
})
export const tuple = <K, V>(key: K, value: V): Tuple<K, V> =>
  conStr0([key, value])

export type SocialRecord =
  | 'NICKNAME'
  | 'EMAIL'
  | 'TELEGRAM'
  | 'PHONE_NUMBER'
  | 'DISCORD'
  | 'GITHUB'
  | 'MEDIUM'
  | 'TWITTER'
