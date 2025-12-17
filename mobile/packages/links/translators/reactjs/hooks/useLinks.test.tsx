import {renderHook} from '@testing-library/react-native'
import React from 'react'

import {LinksProvider} from '../provider/LinksProvider'
import {useLinks} from './useLinks'

describe('useLinks', () => {
  it('should return links context from provider', () => {
    const wrapper = ({children}: {children: React.ReactNode}) => (
      <LinksProvider>{children}</LinksProvider>
    )

    const {result} = renderHook(() => useLinks(), {wrapper})

    expect(result.current).toHaveProperty('pendingAction')
    expect(result.current).toHaveProperty('authorizations')
    expect(result.current).toHaveProperty('actionStarted')
    expect(result.current).toHaveProperty('actionFinished')
    expect(result.current).toHaveProperty('authorizationsChanged')
  })

  it('should work without provider (has default context)', () => {
    const {result} = renderHook(() => useLinks())

    expect(result.current).toHaveProperty('pendingAction')
    expect(result.current).toHaveProperty('authorizations')
  })
})
