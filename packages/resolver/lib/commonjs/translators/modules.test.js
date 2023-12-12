"use strict";

var _api = require("../adapters/api");
var _module = require("./module");
/* istanbul ignore file */

jest.mock('../adapters/api', () => ({
  resolverApiMaker: jest.fn()
}));
describe('resolverModuleMaker', () => {
  const mockStrategy = 'all';
  const mockApiConfig = {
    someKey: 'someValue'
  };
  const mockResolverStorage = {
    notice: 'notice'
  };
  const mockGetCryptoAddress = jest.fn();
  beforeEach(() => {
    // @ts-ignore
    _api.resolverApiMaker.mockImplementation(() => ({
      getCryptoAddress: mockGetCryptoAddress
    }));
  });
  it('creates a module with getCryptoAddress function', () => {
    const module = (0, _module.resolverModuleMaker)(mockStrategy, mockResolverStorage, mockApiConfig);
    expect(module).toHaveProperty('address.getCryptoAddress');
  });
  it('creates a module with notice property', () => {
    const module = (0, _module.resolverModuleMaker)(mockStrategy, mockResolverStorage, mockApiConfig);
    expect(module).toHaveProperty('notice');
  });
  it('calls getCryptoAddress from the created API', () => {
    const module = (0, _module.resolverModuleMaker)(mockStrategy, mockResolverStorage, mockApiConfig);
    const mockDomain = 'example.domain';
    module.address.getCryptoAddress(mockDomain);
    expect(mockGetCryptoAddress).toHaveBeenCalledWith(mockDomain);
  });
});
//# sourceMappingURL=modules.test.js.map