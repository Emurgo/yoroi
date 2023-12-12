import { fetcher } from '@yoroi/common/src';
import { HandleUnknownError, HandleValidationError, getHandleCryptoAddress } from './handle-api';
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
    fetcher.mockResolvedValue({
      resolved_addresses: {
        ada: 'dummyAddress'
      }
    });
    await getHandleCryptoAddress(testDomain);
    expect(fetcher).toHaveBeenCalledWith({
      method: 'get',
      url: expectedUrl,
      headers: {
        Accept: 'application/json'
      }
    });
  });
  it('successfully retrieves crypto address', async () => {
    // @ts-ignore
    fetcher.mockResolvedValueOnce(handleResponse);
    const address = await getHandleCryptoAddress('$domain');
    expect(address).toBe(mockAddress);
  });
  it('throws HandleValidationError for invalid domain', async () => {
    try {
      await getHandleCryptoAddress('domain');
    } catch (error) {
      expect(error).toBeInstanceOf(HandleValidationError);
    }
  });
  it('throws HandleValidationError for invalid response schema', async () => {
    // @ts-ignore
    fetcher.mockResolvedValueOnce({
      invalid: 'response'
    });
    try {
      await getHandleCryptoAddress('$domain');
    } catch (error) {
      expect(error).toBeInstanceOf(HandleValidationError);
    }
  });
  it('throws HandleUnknownError for unknown errors', async () => {
    // @ts-ignore
    fetcher.mockRejectedValueOnce(new Error('Unknown error'));
    try {
      await getHandleCryptoAddress('$domain');
    } catch (error) {
      expect(error).toBeInstanceOf(HandleUnknownError);
    }
  });
});
//# sourceMappingURL=handle-api.test.js.map