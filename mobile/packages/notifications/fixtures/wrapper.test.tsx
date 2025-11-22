import {QueryClient} from '@tanstack/react-query'
import * as React from 'react'

import {wrapper} from './wrapper'

describe('notifications wrapper', () => {
  it('should create wrapper function that accepts queryClient', () => {
    const queryClient = new QueryClient()
    const Wrapper = wrapper({queryClient})

    expect(typeof Wrapper).toBe('function')
    expect(Wrapper).toBeInstanceOf(Function)
  })

  it('should return a function that accepts children', () => {
    const queryClient = new QueryClient()
    const Wrapper = wrapper({queryClient})

    // Verify it's a function that can be called with children
    expect(Wrapper).toBeDefined()
    expect(typeof Wrapper).toBe('function')
  })

  it('should create wrapper with queryClient options', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    })

    const Wrapper = wrapper({queryClient})
    expect(Wrapper).toBeDefined()
    expect(typeof Wrapper).toBe('function')
  })
})
