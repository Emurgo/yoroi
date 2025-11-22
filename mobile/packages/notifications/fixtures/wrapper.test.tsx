import {QueryClient} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import * as React from 'react'

import {wrapper} from './wrapper'

describe('notifications wrapper', () => {
  it('should wrap children with QueryClientProvider and boundaries', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    })

    const Wrapper = wrapper({queryClient})
    const {container} = render(
      <Wrapper>
        <div>Test Content</div>
      </Wrapper>,
    )

    expect(container.textContent).toBe('Test Content')
  })

  it('should create wrapper function that accepts queryClient', () => {
    const queryClient = new QueryClient()
    const Wrapper = wrapper({queryClient})

    expect(typeof Wrapper).toBe('function')
  })
})
