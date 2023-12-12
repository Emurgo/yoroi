import { renderHook } from '@testing-library/react-hooks';
import { useQueryClient } from 'react-query';
import { useSaveResolverNoticeStatus } from './useSaveResolverNoticeStatus';
import { useResolver } from '../provider/ResolverProvider';
jest.mock('react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn()
  })
}));
jest.mock('../provider/ResolverProvider', () => ({
  useResolver: jest.fn()
}));
describe('useSaveResolverNoticeStatus', () => {
  it('calls useResolver and useQueryClient', () => {
    const saveResolverNoticeStatusMock = jest.fn();
    // @ts-ignore
    useResolver.mockReturnValue({
      saveResolverNoticeStatus: saveResolverNoticeStatusMock
    });
    renderHook(() => useSaveResolverNoticeStatus());
    expect(useResolver).toHaveBeenCalled();
    expect(useQueryClient).toHaveBeenCalled();
  });
});
//# sourceMappingURL=useSaveResolverNoticeStatus.test.js.map