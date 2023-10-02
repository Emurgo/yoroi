export type Nullable<T> = T | null | undefined
export type Writable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? Writable<T[P]> : T[P]
}
