import {act, renderHook} from '@testing-library/react-hooks'
import {Subject} from 'rxjs'

import {useObservableValue} from './useObservableValue'

describe('useObservableValue', () => {
  it('should update the data when the observable emits a value', async () => {
    const observable$ = new Subject<void>()
    const getter = jest.fn()
    getter.mockReturnValueOnce('Initial Data')
    getter.mockReturnValue('Updated Data')

    const {result} = renderHook(() =>
      useObservableValue({
        observable$,
        getter,
      }),
    )

    expect(result.current).toBe('Initial Data')

    act(() => {
      observable$.next()
    })

    expect(result.current).toBe('Updated Data')
  })
})
