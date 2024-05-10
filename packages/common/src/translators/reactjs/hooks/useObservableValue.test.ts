import {act, renderHook} from '@testing-library/react-hooks'
import {Subject} from 'rxjs'

import {useObservableValue} from './useObservableValue'

describe('useObservableValue', () => {
  it('should update the data when the observable emits a value', async () => {
    const observable$ = new Subject<void>()
    const executor = jest.fn()
    executor.mockReturnValueOnce('Initial Data')
    executor.mockReturnValue('Updated Data')

    const {result} = renderHook(() =>
      useObservableValue({
        observable$,
        executor,
      }),
    )

    expect(result.current).toBe('Initial Data')

    act(() => {
      observable$.next()
    })

    expect(result.current).toBe('Updated Data')
  })
})
