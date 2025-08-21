import {renderHook} from '@testing-library/react-native'
import * as React from 'react'

import {DappConnectorProvider, useDappConnector} from './DappConnectorProvider'

describe('DappConnectorProvider', () => {
  test('should throw error if used outside of DappConnectorProvider', () => {
    expect(() => {
      renderHook(() => useDappConnector())
    }).toThrow('useDappConnector must be used within a DappConnectorProvider')
  })

  test('should return manager if used within DappConnectorProvider', () => {
    const manager = {} as any
    const wrapper = ({children}: React.PropsWithChildren) => (
      <DappConnectorProvider manager={manager}>
        {children}
      </DappConnectorProvider>
    )
    const {result} = renderHook(() => useDappConnector(), {wrapper})
    expect(result.current.manager).toBe(manager)
  })
})
