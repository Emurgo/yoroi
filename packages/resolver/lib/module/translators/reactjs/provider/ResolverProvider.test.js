import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { ResolverProvider, defaultResolverState, resolverReducer, useResolver } from './ResolverProvider';
const fakeAddressResponse = {
  address: 'fake-address',
  error: null,
  service: 'fake-service'
};
const fakeAddressesResponses = [{
  address: 'fake-address',
  error: null,
  service: 'fake-service'
}];
const resolverModuleMock = {
  address: {
    getCryptoAddress: jest.fn(_receiver => Promise.resolve(fakeAddressesResponses))
  },
  notice: {
    read: jest.fn(() => Promise.resolve(true)),
    remove: jest.fn(),
    save: jest.fn(),
    key: 'string'
  }
};
describe('ResolverProvider', () => {
  let queryClient;
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0
        },
        mutations: {
          retry: false
        }
      }
    });
  });
  afterEach(() => {
    queryClient.clear();
  });
  it('saveResolverNoticeStatus', () => {
    const wrapper = _ref => {
      let {
        children
      } = _ref;
      return /*#__PURE__*/React.createElement(QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = renderHook(() => useResolver(), {
      wrapper
    });
    expect(resolverModuleMock.notice.save).not.toHaveBeenCalled();
    act(() => {
      result.current.saveResolverNoticeStatus(true);
    });
    expect(resolverModuleMock.notice.save).toHaveBeenCalledWith(true);
  });
  it('readResolverNoticeStatus', async () => {
    const wrapper = _ref2 => {
      let {
        children
      } = _ref2;
      return /*#__PURE__*/React.createElement(QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = renderHook(() => useResolver(), {
      wrapper
    });
    expect(await result.current.readResolverNoticeStatus()).toBe(true);
  });
  it('getCryptoAddress', async () => {
    const wrapper = _ref3 => {
      let {
        children
      } = _ref3;
      return /*#__PURE__*/React.createElement(QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = renderHook(() => useResolver(), {
      wrapper
    });
    expect(await result.current.getCryptoAddress('fake-receiver')).toEqual(fakeAddressesResponses);
  });
  it('resolvedAddressSelectedChanged', async () => {
    const wrapper = _ref4 => {
      let {
        children
      } = _ref4;
      return /*#__PURE__*/React.createElement(QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = renderHook(() => useResolver(), {
      wrapper
    });
    expect(result.current.resolvedAddressSelected).toBe(null);
    act(() => {
      return result.current.resolvedAddressSelectedChanged(fakeAddressResponse);
    });
    expect(result.current.resolvedAddressSelected).toEqual(fakeAddressResponse);
  });
});
describe('resolverReducer', () => {
  it('default state', () => {
    const state = resolverReducer(defaultResolverState, {
      type: 'FAKE_ACTION'
    });
    expect(state.resolvedAddressSelected).toBe(defaultResolverState.resolvedAddressSelected);
  });
  it('resolvedAddressSelectedChanged', () => {
    const state = resolverReducer(defaultResolverState, {
      type: 'resolvedAddressSelectedChanged',
      resolvedAddressSelected: fakeAddressResponse
    });
    expect(state.resolvedAddressSelected).toEqual(fakeAddressResponse);
  });
});
//# sourceMappingURL=ResolverProvider.test.js.map