"use strict";

var _resolution = require("@unstoppabledomains/resolution");
var _unstoppableApi = require("./unstoppable-api");
jest.mock('@unstoppabledomains/resolution');
describe('getUnstoppableCryptoAddress', () => {
  const mockDomain = 'example.crypto';
  const mockApiKey = 'testApiKey';
  const mockAddress = 'ADA_Address';
  beforeEach(() => {
    // @ts-ignore
    _resolution.Resolution.mockClear();
  });
  it('resolves crypto address successfully', async () => {
    // @ts-ignore
    _resolution.Resolution.mockImplementation(() => ({
      addr: jest.fn().mockResolvedValue(mockAddress)
    }));
    const address = await (0, _unstoppableApi.getUnstoppableCryptoAddress)(mockDomain, mockApiKey);
    expect(address).toBe(mockAddress);
  });
  it('throws UnstoppableValidationError for invalid response', async () => {
    // @ts-ignore
    _resolution.Resolution.mockImplementation(() => ({
      addr: jest.fn().mockResolvedValue(null)
    }));
    await expect((0, _unstoppableApi.getUnstoppableCryptoAddress)(mockDomain, mockApiKey)).rejects.toThrow(_unstoppableApi.UnstoppableValidationError);
  });
  it('throws UnstoppableUnknownError for unknown errors', async () => {
    const mockError = new Error('Unknown error');
    // @ts-ignore
    _resolution.Resolution.mockImplementation(() => ({
      addr: jest.fn().mockRejectedValue(mockError)
    }));
    await expect((0, _unstoppableApi.getUnstoppableCryptoAddress)(mockDomain, mockApiKey)).rejects.toThrow(_unstoppableApi.UnstoppableUnknownError);
  });
});
//# sourceMappingURL=unstoppable-api.test.js.map