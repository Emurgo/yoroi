import { renderHook } from '@testing-library/react-hooks';
import { useQuery, useQueryClient } from 'react-query';
import { useReadResolverNoticeStatus } from './useReadResolverNoticeStatus';
import { useResolver } from '../provider/ResolverProvider';
jest.mock('react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn()
}));
jest.mock('../provider/ResolverProvider', () => ({
  useResolver: jest.fn()
}));
describe('useReadResolverNoticeStatus', () => {
  it('initializes and calls necessary functions', () => {
    const readResolverNoticeStatusMock = jest.fn();
    // @ts-ignore
    useResolver.mockImplementation(() => ({
      readResolverNoticeStatus: readResolverNoticeStatusMock
    }));
    const invalidateQueriesMock = jest.fn();
    // @ts-ignore
    useQueryClient.mockImplementation(() => ({
      invalidateQueries: invalidateQueriesMock
    }));
    renderHook(() => useReadResolverNoticeStatus());
    expect(useResolver).toHaveBeenCalled();
    expect(useQueryClient).toHaveBeenCalled();
    expect(useQuery).toHaveBeenCalledWith({
      queryKey: ['resolver'],
      queryFn: readResolverNoticeStatusMock,
      onSuccess: expect.any(Function)
    });
  });
  it('calls invalidateQueries on success', () => {
    const invalidateQueriesMock = jest.fn();
    // @ts-ignore
    useQueryClient.mockImplementation(() => ({
      invalidateQueries: invalidateQueriesMock
    }));

    // @ts-ignore
    useQuery.mockImplementation(_ref => {
      let {
        onSuccess
      } = _ref;
      onSuccess();
      return {
        data: 'mockData'
      };
    });
    const {
      result
    } = renderHook(() => useReadResolverNoticeStatus());
    expect(invalidateQueriesMock).toHaveBeenCalledWith(['resolver']);
    expect(result.current.readResolverNoticeStatus).toEqual('mockData');
  });
});
//# sourceMappingURL=useReadResolverNoticeStatus.test.js.map