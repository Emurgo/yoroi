// @flow
import {delay} from './promise'

// Ignores any concurrent calls to this function
// and instead instantly resolves with null
export const ignoreConcurrentAsync = <T, R>(
  handler: (T) => Promise<R>,
  additionalDelay?: number,
): ((T) => Promise<?R>) => {
  let _inProgress = false
  return async (...args) => {
    if (_inProgress) return null
    _inProgress = true
    try {
      return await handler(...args)
    } finally {
      // runaway
      delay(additionalDelay || 0).then(() => {
        _inProgress = false
      })
    }
  }
}

// Turns handler working like this: handler = (props) => (...args) => result
// Into  handler working like this: handler = (props, ...args) => result
// $FlowFixMe
const curry = (fn) => (arg, ...rest) => fn(arg)(...rest)

// Turns handler working like this: handler = (props, ...args) => result
// Into  handler working like this: handler = (props) => (...args) => result
// $FlowFixMe
const uncurry = (fn) => (arg) => (...rest) => fn(arg, ...rest)

// For use in withHandlers.
// Warning: This keeps one concurrent instance
// *per component declaration* (e.g. multiple
// component instances share the limit)
export const ignoreConcurrentAsyncHandler = <Props, T, R>(
  handler: (Props) => (T) => Promise<R>,
  additionalDelay?: number,
): ((Props) => (T) => Promise<?R>) => {
  // $FlowFixMe
  return uncurry(ignoreConcurrentAsync(curry(handler), additionalDelay))
}

// Extracted from
// eslint-disable-next-line
// https://stackoverflow.com/questions/44700904/how-to-get-a-functions-return-type-in-flow
type _ExtractFunctionReturnType<B, F: (...args: any[]) => B> = B // eslint-disable-line
export type ExtractFunctionReturnType<F> = _ExtractFunctionReturnType<any, F>
