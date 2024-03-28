import * as React from 'react'
import {renderHook, act} from '@testing-library/react-hooks'

import {enableMapSet} from 'immer'
enableMapSet()

import {LinksProvider} from './LinksProvider'
import {useLinks} from '../hooks/useLinks'
import {mocks} from '../state/state.mocks'

describe('LinksProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('AuthorizationsChanged', () => {
    const wrapper = ({children}: any) => (
      <LinksProvider>{children}</LinksProvider>
    )

    const {result} = renderHook(() => useLinks(), {
      wrapper,
    })

    act(() => {
      result.current.authorizationsChanged('walletId', 'authorization')
    })

    expect(result.current.authorizations).toEqual(
      new Map([['walletId', 'authorization']]),
    )
  })

  it('ActionStarted', () => {
    const wrapper = ({children}: any) => (
      <LinksProvider>{children}</LinksProvider>
    )

    const {result} = renderHook(() => useLinks(), {
      wrapper,
    })

    act(() => {
      result.current.actionStarted({
        info: mocks.exchangeActionInfo,
        isTrusted: false,
      })
    })

    expect(result.current.action).toEqual({
      info: mocks.exchangeActionInfo,
      isTrusted: false,
    })
  })

  it('ActionFinished', () => {
    const wrapper = ({children}: any) => (
      <LinksProvider>{children}</LinksProvider>
    )

    const {result} = renderHook(() => useLinks(), {
      wrapper,
    })

    act(() => {
      result.current.actionFinished()
    })

    expect(result.current.action).toBeNull()
  })
})
