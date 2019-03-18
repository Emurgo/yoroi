// @flow
import produce from 'immer'
import {get, set} from 'lodash'

import type {SegmentReducer, Path} from '../types/reduxTypes'

const normalizeObjBeforeMap = (data: Array<Object> | Object): Array<Object> =>
  Array.isArray(data) ? data : [data]

// obj handled as a single element of an array
export const mappingFn = (
  data: Array<Object> | Object,
  mapByProp?: number | string = 'id',
) =>
  normalizeObjBeforeMap(data).reduce(
    (obj, current: {[string | number]: string | number}) => {
      obj[current[mapByProp]] = current
      return obj
    },
    {},
  )

export const mapArrayToId = (
  data: Array<Object>,
  id: number | string,
  mapByProp?: string,
) => ({
  [id]: mappingFn(data, mapByProp),
})

export const mapObjToId = (data: Object, id: number | string) => ({
  [id]: data,
})

/**
 * When no path is given, interpret this as setting the root level of the object
 * (AKA replacing the object entirely)
 */
export const immutableSet = (obj: Object, path: ?Path, value: any) =>
  path && path.length
    ? produce(
        (obj): void => {
          set(obj, path, value)
        },
      )(obj)
    : value

/*
 * Forward reducer transform to a particular state path.
 * If the element at `path` does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 *
 * You can pass an undefined path to mean you want to replaace the whole state
 */
export const forwardReducerTo = <S: Object, T>(
  reducer: SegmentReducer<S, T>,
  path: ?Path,
) => (state: S, payload: T) => {
  const value = path ? get(state, path) : state // get root
  const newValue = reducer(value, payload)
  return newValue !== value ? immutableSet(state, path, newValue) : state
}
