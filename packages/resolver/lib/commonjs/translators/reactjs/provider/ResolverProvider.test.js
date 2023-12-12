"use strict";

var React = _interopRequireWildcard(require("react"));
var _reactQuery = require("react-query");
var _reactHooks = require("@testing-library/react-hooks");
var _ResolverProvider = require("./ResolverProvider");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
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
    queryClient = new _reactQuery.QueryClient({
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
      return /*#__PURE__*/React.createElement(_reactQuery.QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(_ResolverProvider.ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = (0, _reactHooks.renderHook)(() => (0, _ResolverProvider.useResolver)(), {
      wrapper
    });
    expect(resolverModuleMock.notice.save).not.toHaveBeenCalled();
    (0, _reactHooks.act)(() => {
      result.current.saveResolverNoticeStatus(true);
    });
    expect(resolverModuleMock.notice.save).toHaveBeenCalledWith(true);
  });
  it('readResolverNoticeStatus', async () => {
    const wrapper = _ref2 => {
      let {
        children
      } = _ref2;
      return /*#__PURE__*/React.createElement(_reactQuery.QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(_ResolverProvider.ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = (0, _reactHooks.renderHook)(() => (0, _ResolverProvider.useResolver)(), {
      wrapper
    });
    expect(await result.current.readResolverNoticeStatus()).toBe(true);
  });
  it('getCryptoAddress', async () => {
    const wrapper = _ref3 => {
      let {
        children
      } = _ref3;
      return /*#__PURE__*/React.createElement(_reactQuery.QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(_ResolverProvider.ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = (0, _reactHooks.renderHook)(() => (0, _ResolverProvider.useResolver)(), {
      wrapper
    });
    expect(await result.current.getCryptoAddress('fake-receiver')).toEqual(fakeAddressesResponses);
  });
  it('resolvedAddressSelectedChanged', async () => {
    const wrapper = _ref4 => {
      let {
        children
      } = _ref4;
      return /*#__PURE__*/React.createElement(_reactQuery.QueryClientProvider, {
        client: queryClient
      }, /*#__PURE__*/React.createElement(_ResolverProvider.ResolverProvider, {
        resolverModule: resolverModuleMock
      }, children));
    };
    const {
      result
    } = (0, _reactHooks.renderHook)(() => (0, _ResolverProvider.useResolver)(), {
      wrapper
    });
    expect(result.current.resolvedAddressSelected).toBe(null);
    (0, _reactHooks.act)(() => {
      return result.current.resolvedAddressSelectedChanged(fakeAddressResponse);
    });
    expect(result.current.resolvedAddressSelected).toEqual(fakeAddressResponse);
  });
});
describe('resolverReducer', () => {
  it('default state', () => {
    const state = (0, _ResolverProvider.resolverReducer)(_ResolverProvider.defaultResolverState, {
      type: 'FAKE_ACTION'
    });
    expect(state.resolvedAddressSelected).toBe(_ResolverProvider.defaultResolverState.resolvedAddressSelected);
  });
  it('resolvedAddressSelectedChanged', () => {
    const state = (0, _ResolverProvider.resolverReducer)(_ResolverProvider.defaultResolverState, {
      type: 'resolvedAddressSelectedChanged',
      resolvedAddressSelected: fakeAddressResponse
    });
    expect(state.resolvedAddressSelected).toEqual(fakeAddressResponse);
  });
});
//# sourceMappingURL=ResolverProvider.test.js.map