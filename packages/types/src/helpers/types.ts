export type Nullable<T> = T | null | undefined
export type Writable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Writable<T[P]> : T[P]
}
export type RemoveUndefined<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined>
}
