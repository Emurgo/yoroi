import {Swap} from '@yoroi/types'
import {selectedPoolCalculationSelector} from './selectedPoolCalculationSelector'

describe('selectedPoolCalculationSelector', () => {
  it('should return the best pool from calculations when type is limit and selectedPoolId matches', () => {
    const orderData = {
      type: 'limit' as Swap.OrderType,
      selectedPoolId: '1',
      calculations: [
        {pool: {poolId: '1'}} as Swap.OrderCalculation,
        {pool: {poolId: '2'}} as Swap.OrderCalculation,
      ],
      bestPoolCalculation: {
        pool: {poolId: '3'},
      } as Swap.OrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.calculations[0])
  })

  it('should return the state bestPoolCalculation when no match is found in calculations', () => {
    const orderData = {
      type: 'limit' as Swap.OrderType,
      selectedPoolId: '3',
      calculations: [
        {pool: {poolId: '1'}} as Swap.OrderCalculation,
        {pool: {poolId: '2'}} as Swap.OrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as Swap.OrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })

  it('should return state bestPool when type is market', () => {
    const orderData = {
      type: 'market' as Swap.OrderType,
      selectedPoolId: '1',
      calculations: [
        {pool: {poolId: '1'}} as Swap.OrderCalculation,
        {pool: {poolId: '2'}} as Swap.OrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as Swap.OrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })

  it('should return the the current bestPoolCalculation when no selectedPoolId', () => {
    const orderData = {
      type: 'limit' as Swap.OrderType,
      selectedPoolId: undefined,
      calculations: [
        {pool: {poolId: '1'}} as Swap.OrderCalculation,
        {pool: {poolId: '2'}} as Swap.OrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as Swap.OrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })
})
