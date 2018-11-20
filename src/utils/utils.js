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

// fn(x)(y) => fn'(x,y)
// $FlowFixMe
const curry = (fn) => (arg, ...rest) => fn(arg)(...rest)
// fn(x,y) => fn(x)(y)
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
