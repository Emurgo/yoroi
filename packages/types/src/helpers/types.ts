export type Nullable<T> = T | null | undefined

export type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}
