"use strict";

var _src = require("@yoroi/common/src");
var _handleApi = require("./handle-api");
jest.mock('@yoroi/common/src', () => ({
  fetcher: jest.fn()
}));
describe('getHandleCryptoAddress', () => {
  const mockAddress = 'some-ada-address';
  const handleResponse = {
    resolved_addresses: {
      ada: mockAddress
    }
  };
  it('should generate the correct config url', async () => {
    const testDomain = '$testHandle';
    const expectedUrl = `https://api.handle.me/handles/testHandle`;

    // @ts-ignore
    _src.fetcher.mockResolvedValue({
      resolved_addresses: {
        ada: 'dummyAddress'
      }
    });
    await (0, _handleApi.getHandleCryptoAddress)(testDomain);
    expect(_src.fetcher).toHaveBeenCalledWith({
      method: 'get',
      url: expectedUrl,
      headers: {
        Accept: 'application/json'
      }
    });
  });
  it('successfully retrieves crypto address', async () => {
    // @ts-ignore
    _src.fetcher.mockResolvedValueOnce(handleResponse);
    const address = await (0, _handleApi.getHandleCryptoAddress)('$domain');
    expect(address).toBe(mockAddress);
  });
  it('throws HandleValidationError for invalid domain', async () => {
    try {
      await (0, _handleApi.getHandleCryptoAddress)('domain');
    } catch (error) {
      expect(error).toBeInstanceOf(_handleApi.HandleValidationError);
    }
  });
  it('throws HandleValidationError for invalid response schema', async () => {
    // @ts-ignore
    _src.fetcher.mockResolvedValueOnce({
      invalid: 'response'
    });
    try {
      await (0, _handleApi.getHandleCryptoAddress)('$domain');
    } catch (error) {
      expect(error).toBeInstanceOf(_handleApi.HandleValidationError);
    }
  });
  it('throws HandleUnknownError for unknown errors', async () => {
    // @ts-ignore
    _src.fetcher.mockRejectedValueOnce(new Error('Unknown error'));
    try {
      await (0, _handleApi.getHandleCryptoAddress)('$domain');
    } catch (error) {
      expect(error).toBeInstanceOf(_handleApi.HandleUnknownError);
    }
  });
});
//# sourceMappingURL=handle-api.test.js.map