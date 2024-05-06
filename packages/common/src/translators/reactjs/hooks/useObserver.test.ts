import {act, renderHook, waitFor} from '@testing-library/react-native'
import {Subject} from 'rxjs'

import {useObserver} from './useObserver'

describe('useObserver', () => {
  it('should update the data when the observable emits a value', async () => {
    const observable = new Subject<string>()
    const executor = jest.fn().mockReturnValue('Initial Data')

    const {result} = renderHook(() =>
      useObserver({
        observable,
        executor,
      }),
    )

    expect(result.current.data).toBe('Initial Data')
    expect(result.current.isPending).toBe(false)

    act(() => {
      observable.next('World')
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // initial state
    // + 1st event
    // + 2nd event
    expect(executor).toHaveBeenCalledTimes(3)
  })
})
