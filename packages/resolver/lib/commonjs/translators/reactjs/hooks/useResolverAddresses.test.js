"use strict";

var _reactHooks = require("@testing-library/react-hooks");
var _reactQuery = require("react-query");
var _useResolverAddresses = require("./useResolverAddresses");
var _ResolverProvider = require("../provider/ResolverProvider");
jest.mock('react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn()
  })
}));
jest.mock('../provider/ResolverProvider', () => ({
  useResolver: jest.fn()
}));
describe('useResolverAddresses', () => {
  it('calls useResolver and useQueryClient', () => {
    const getCryptoAddressMock = jest.fn();
    // @ts-ignore
    _ResolverProvider.useResolver.mockReturnValue({
      getCryptoAddress: getCryptoAddressMock
    });
    (0, _reactHooks.renderHook)(() => (0, _useResolverAddresses.useResolverAddresses)({
      receiver: 'test-receiver'
    }));
    expect(_ResolverProvider.useResolver).toHaveBeenCalled();
    expect(_reactQuery.useQueryClient).toHaveBeenCalled();
  });
});
//# sourceMappingURL=useResolverAddresses.test.js.map