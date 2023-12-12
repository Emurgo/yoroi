import { renderHook } from '@testing-library/react-hooks';
import { useQueryClient } from 'react-query';
import { useResolverAddresses } from './useResolverAddresses';
import { useResolver } from '../provider/ResolverProvider';
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
    useResolver.mockReturnValue({
      getCryptoAddress: getCryptoAddressMock
    });
    renderHook(() => useResolverAddresses({
      receiver: 'test-receiver'
    }));
    expect(useResolver).toHaveBeenCalled();
    expect(useQueryClient).toHaveBeenCalled();
  });
});
//# sourceMappingURL=useResolverAddresses.test.js.map