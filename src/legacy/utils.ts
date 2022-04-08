/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import produce from 'immer'
import {get, set} from 'lodash'

import type {Path, SegmentReducer} from '../../legacy/types/reduxTypes'

const normalizeObjBeforeMap = (data: Array<Record<string, any>> | Record<string, any>): Array<Record<string, any>> =>
  Array.isArray(data) ? data : [data]

// obj handled as a single element of an array
export const mappingFn = (data: Array<Record<string, any>> | Record<string, any>, mapByProp: number | string = 'id') =>
  normalizeObjBeforeMap(data).reduce((obj, current: {[key in string | number]?: string | number}) => {
    obj[current[mapByProp] as any] = current
    return obj
  }, {})
export const mapArrayToId = (data: Array<Record<string, any>>, id: number | string, mapByProp?: string) => {
  const dict = {}
  dict[id] = mappingFn(data, mapByProp)
  return dict
}
export const mapObjToId = (data: Record<string, any>, id: number | string) => {
  const dict = {}
  dict[id] = data
  return dict
}
export const immutableSet = <S extends {}>(obj: S, path: Path | null | undefined, value: S): S =>
  path && path.length
    ? produce((obj): void => {
        set(obj, path, value)
      })(obj) || value
    : value

/*
 * Forward reducer transform to a particular state path.
 * If the last path element does not exist, reducer will get undefined
 * so that you can use reduce(state=initialState(), payload) => ...
 *
 * Does not create new state if the value did not change
 */
export function forwardReducerTo<S extends {}, T>(
  reducer: SegmentReducer<S, T | void>,
  path: Path | null | undefined,
): (state: S, payload: T | void) => S {
  return (state: S, payload: T | void) => {
    const value: S = path ? get(state, path) : state
    const newValue = reducer(value, payload)
    return newValue !== value ? immutableSet(state, path, newValue) : state
  }
}
