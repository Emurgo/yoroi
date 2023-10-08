import {SwapOrderCalculation, SwapState} from '../state' // adjust the import path
import {mockSwapStateDefault} from '../state.mocks'
import {selectedPoolCalculationSelector} from './selectedPoolCalculationSelector'

describe('selectedPoolCalculationSelector', () => {
  it('should return the best pool from calculations when type is limit and selectedPoolId matches', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'limit',
      selectedPoolId: '1',
      calculations: [
        {pool: {poolId: '1'}} as SwapOrderCalculation,
        {pool: {poolId: '2'}} as SwapOrderCalculation,
      ],
      bestPoolCalculation: {
        pool: {poolId: '3'},
      } as SwapOrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.calculations[0])
  })

  it('should return the state bestPoolCalculation when no match is found in calculations', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'limit',
      selectedPoolId: '3',
      calculations: [
        {pool: {poolId: '1'}} as SwapOrderCalculation,
        {pool: {poolId: '2'}} as SwapOrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as SwapOrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })

  it('should return state bestPool when type is market', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'market',
      selectedPoolId: '1',
      calculations: [
        {pool: {poolId: '1'}} as SwapOrderCalculation,
        {pool: {poolId: '2'}} as SwapOrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as SwapOrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })

  it('should return the the current bestPoolCalculation when no selectedPoolId', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'limit',
      selectedPoolId: undefined,
      calculations: [
        {pool: {poolId: '1'}} as SwapOrderCalculation,
        {pool: {poolId: '2'}} as SwapOrderCalculation,
      ],
      bestPoolCalculation: {pool: {poolId: '3'}} as SwapOrderCalculation,
    }

    const selected = selectedPoolCalculationSelector(orderData)
    expect(selected).toEqual(orderData.bestPoolCalculation)
  })
})
