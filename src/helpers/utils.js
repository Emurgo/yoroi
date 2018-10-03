// @flow
import produce from 'immer'
import {get, set} from 'lodash'
import type {SegmentReducer, Path} from '../types/reduxTypes'
import moment from 'moment'

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

// Fixme: Get real values and put it into config somewhere
export const confirmationsToAssuranceLevel = (confirmations: number) => {
  if (confirmations < 5) {
    return 'LOW'
  }

  if (confirmations < 9) {
    return 'MEDIUM'
  }

  return 'HIGH'
}

export const processTxHistoryData = (data: any, ownAddresses: Array<string>) => {
  const ownInputs = data.inputs_address.map((address, index) => {
    return {
      address,
      amount: parseInt(data.inputs_amount[index], 10),
    }
  }).filter((input) => ownAddresses.includes(input.address))

  const ownOutputs = data.outputs_address.map((address, index) => {
    return {
      address,
      amount: parseInt(data.outputs_amount[index], 10),
    }
  }).filter((input) => ownAddresses.includes(input.address))

  const hasOnlyOwnInputs = ownInputs.length === data.inputs_address
  const hasOnlyOwnOutputs = ownOutputs.length === data.outputs_address
  const isIntraWallet = hasOnlyOwnInputs && hasOnlyOwnOutputs

  const incomingAmount = ownOutputs.reduce((reduce, output) => reduce + output.amount, 0)
  const outgoingAmount = ownInputs.reduce((reduce, input) => reduce + input.amount, 0)

  const resultTxAmount = incomingAmount - outgoingAmount

  return {
    id: data.hash,
    fromAddresses: data.inputs_address,
    toAddresses: data.outputs_address,
    amount: resultTxAmount,
    confirmations: parseInt(data.best_block_num, 10) - parseInt(data.block_num, 10),
    type: resultTxAmount >= 0 ? 'RECEIVED' : 'SENT',
    isIntraWallet,
    timestamp: moment(data.time),
    updatedAt: moment(data.last_update),
  }
}

export const printAda = (amount: number) => {
  // 1 ADA = 1 000 000 micro ada
  return (amount / 1000000).toFixed(6)
}
