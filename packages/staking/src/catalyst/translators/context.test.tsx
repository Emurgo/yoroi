import {renderHook} from '@testing-library/react-native'

import {useCatalyst} from './context'
import {catalystConfig} from '../config'
import {wrapperManagerFixture} from '../../fixtures/manager-wrapper'
import {queryClientFixture} from '../../fixtures/query-client'

describe('CatalystProvider', () => {
  const manager = {
    config: catalystConfig,
    getFundInfo: jest.fn(),
    fundStatus: jest.fn(),
  }

  it('CatalystProvider', () => {
    const {result} = renderHook(() => useCatalyst(), {
      wrapper: wrapperManagerFixture({
        manager,
        queryClient: queryClientFixture(),
      }),
    })

    expect(result.current.config).toBe(catalystConfig)
  })
})
