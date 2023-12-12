"use strict";

var _api = require("./api");
var _handleApi = require("./handle-api");
var _unstoppableApi = require("./unstoppable-api");
jest.mock('./handle-api', () => ({
  getHandleCryptoAddress: jest.fn()
}));
jest.mock('./unstoppable-api', () => ({
  getUnstoppableCryptoAddress: jest.fn()
}));
describe('resolverApiMaker', () => {
  const mockDomain = 'example.domain';
  it('resolves all addresses with strategy "all"', async () => {
    // @ts-ignore
    _handleApi.getHandleCryptoAddress.mockResolvedValue('handleAddress');
    // @ts-ignore
    _unstoppableApi.getUnstoppableCryptoAddress.mockResolvedValue('unstoppableAddress');
    const api = (0, _api.resolverApiMaker)('all');
    const results = await api.getCryptoAddress(mockDomain);
    expect(results).toEqual([{
      address: 'handleAddress',
      error: null,
      service: 'handle'
    }, {
      address: 'unstoppableAddress',
      error: null,
      service: 'unstoppable'
    }, {
      address: null,
      error: 'not-implemented',
      service: 'cns'
    }]);
  });
  it('handles errors with strategy "all"', async () => {
    const mockError = new Error('Test Error');
    // @ts-ignore
    _handleApi.getHandleCryptoAddress.mockResolvedValue('handleAddress');
    // @ts-ignore
    _unstoppableApi.getUnstoppableCryptoAddress.mockRejectedValue(mockError);
    const api = (0, _api.resolverApiMaker)('all');
    const results = await api.getCryptoAddress(mockDomain);
    expect(results).toEqual([{
      address: 'handleAddress',
      error: null,
      service: 'handle'
    }, {
      address: null,
      error: mockError.message,
      service: 'unstoppable'
    }, {
      address: null,
      error: 'not-implemented',
      service: 'cns'
    }]);
  });
  it('resolves first successful address with strategy "first"', async () => {
    // @ts-ignore
    _handleApi.getHandleCryptoAddress.mockRejectedValue(new Error('Test Error'));
    // @ts-ignore
    _unstoppableApi.getUnstoppableCryptoAddress.mockResolvedValue('unstoppableAddress');
    const api = (0, _api.resolverApiMaker)('first');
    const results = await api.getCryptoAddress(mockDomain);
    expect(results).toEqual([{
      address: 'unstoppableAddress',
      error: null,
      service: 'unstoppable'
    }]);
  });
  it('handles all errors with strategy "first"', async () => {
    const mockError = new Error('Test Error');
    // @ts-ignore
    _handleApi.getHandleCryptoAddress.mockRejectedValue(mockError);
    // @ts-ignore
    _unstoppableApi.getUnstoppableCryptoAddress.mockRejectedValue(mockError);
    const api = (0, _api.resolverApiMaker)('first');
    try {
      await api.getCryptoAddress(mockDomain);
    } catch (error) {
      expect(error).toEqual(mockError);
    }
  });
});
//# sourceMappingURL=api.test.js.map