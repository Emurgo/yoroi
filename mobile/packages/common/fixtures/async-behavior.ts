import {freeze} from 'immer'

const success = <T = never>(result: T) => Promise.resolve(result)
const loading = <T = never>() => new Promise<T>(() => {})
const error = <T = never>(rejectWith?: Error) =>
  Promise.reject<T>(rejectWith ?? new Error('Unknown error'))
const delayed = <T = never>({
  data,
  timeout = 3000,
}: {
  data: T
  timeout?: number
}) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), timeout)
  })
const empty = <T = never>(emptyRepresentation: T) =>
  Promise.resolve(emptyRepresentation)

const asyncBehaviorMaker = <T>({
  otherErrors,
  data,
  timeout,
  emptyRepresentation,
}: {
  otherErrors?: {[error: string]: typeof error}
  data: T
  timeout?: number
  emptyRepresentation: any
}) =>
  freeze({
    delayed: (..._args: never) => delayed<T>({data, timeout}),
    empty: (..._args: never) => empty<T>(emptyRepresentation),
    error: {...otherErrors, unknown: (..._args: never) => error<T>()},
    loading,
    success: (..._args: never) => success<T>(data),
  })

export const asyncBehavior = freeze({
  delayed,
  empty,
  error,
  loading,
  success,

  maker: asyncBehaviorMaker,
})
