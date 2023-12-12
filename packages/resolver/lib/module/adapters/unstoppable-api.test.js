import { Resolution } from '@unstoppabledomains/resolution';
import { getUnstoppableCryptoAddress, UnstoppableValidationError, UnstoppableUnknownError } from './unstoppable-api';
jest.mock('@unstoppabledomains/resolution');
describe('getUnstoppableCryptoAddress', () => {
  const mockDomain = 'example.crypto';
  const mockApiKey = 'testApiKey';
  const mockAddress = 'ADA_Address';
  beforeEach(() => {
    // @ts-ignore
    Resolution.mockClear();
  });
  it('resolves crypto address successfully', async () => {
    // @ts-ignore
    Resolution.mockImplementation(() => ({
      addr: jest.fn().mockResolvedValue(mockAddress)
    }));
    const address = await getUnstoppableCryptoAddress(mockDomain, mockApiKey);
    expect(address).toBe(mockAddress);
  });
  it('throws UnstoppableValidationError for invalid response', async () => {
    // @ts-ignore
    Resolution.mockImplementation(() => ({
      addr: jest.fn().mockResolvedValue(null)
    }));
    await expect(getUnstoppableCryptoAddress(mockDomain, mockApiKey)).rejects.toThrow(UnstoppableValidationError);
  });
  it('throws UnstoppableUnknownError for unknown errors', async () => {
    const mockError = new Error('Unknown error');
    // @ts-ignore
    Resolution.mockImplementation(() => ({
      addr: jest.fn().mockRejectedValue(mockError)
    }));
    await expect(getUnstoppableCryptoAddress(mockDomain, mockApiKey)).rejects.toThrow(UnstoppableUnknownError);
  });
});
//# sourceMappingURL=unstoppable-api.test.js.map