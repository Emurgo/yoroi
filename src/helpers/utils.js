// @flow
import produce from 'immer'
import {get, set} from 'lodash'

import type {SegmentReducer, Path} from '../types/reduxTypes'

const normalizeObjBeforeMap = (data: Array<Object> | Object): Array<Object> =>
  Array.isArray(data) ? data : [data]

// obj handled as a single element of an array
export const mappingFn = (data: Array<Object> | Object, mapByProp?: number | string = 'id') =>
  normalizeObjBeforeMap(data).reduce((obj, current: {[string | number]: string | number}) => {
    obj[current[mapByProp]] = current
    return obj
  }, {})

export const mapArrayToId = (data: Array<Object>, id: number | string, mapByProp?: string) => ({
  [id]: mappingFn(data, mapByProp),
})

export const mapObjToId = (data: Object, id: number | string) => ({
  [id]: data,
})

export const immutableSet = (obj: Object, path: ?Path, value: any) =>
  path && path.length
    ? produce(
      (obj): void => {
        set(obj, path, value)
      }
    )(obj)
    : value
/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export const forwardReducerTo = <S: Object, T>(reducer: SegmentReducer<S, T>, path: ?Path) => (
  state: S,
  payload: T
) => {
  const value = path ? get(state, path) : state
  const newValue = reducer(value, payload)
  return newValue !== value ? immutableSet(state, path, newValue) : state
}
