// prettier-ignore
export const alpha = <T>(transform: Transform<T>)=>(a: T, b: T) => transform(a) > transform(b) ? -1 : 1

// prettier-ignore
export const startsWith = <T>(predicate: (a: T) => boolean) => (a: T) => predicate(a) ? -1 : 1

type Transform<T> = (a: T) => string | number
